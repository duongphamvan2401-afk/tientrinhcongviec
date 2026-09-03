import { MatrixRow, Cognitive3Levels, MatrixCellScore } from '../types';
import { getMatrixRow19Values } from './dateCalculations';

export interface MatrixFormatStats {
  totalNlc: number;
  totalDs: number;
  totalTln: number;
  totalTl: number;
  grandTotalQuestions: number;

  scoreNlc: number;
  scoreDs: number;
  scoreTln: number;
  scoreTl: number;

  pctNlc: number;
  pctDs: number;
  pctTln: number;
  pctTl: number;

  scoreBiet: number;
  scoreHieu: number;
  scoreVanDung: number;
  scoreVanDungCao: number;

  pctBiet: number;
  pctHieu: number;
  pctVanDung: number;
  pctVanDungCao: number;

  grandScore: number;
  isBalanced: boolean;
  hasZeroFormat: boolean;
}

/**
 * Tính toán toàn diện số lượng câu hỏi, điểm số và tỉ lệ % cho 4 dạng câu hỏi và các mức độ nhận thức
 */
export function calculateMatrixTotals(rows: MatrixRow[]): MatrixFormatStats {
  let sumNlcBiet = 0;
  let sumNlcHieu = 0;
  let sumNlcVanDung = 0;

  let sumDsBiet = 0;
  let sumDsHieu = 0;
  let sumDsVanDung = 0;

  let sumTlnBiet = 0;
  let sumTlnHieu = 0;
  let sumTlnVanDung = 0;

  let sumTlBiet = 0;
  let sumTlHieu = 0;
  let sumTlVanDung = 0;
  let sumTlVanDungCao = 0;

  let grandScore = 0;

  rows.forEach((r) => {
    const vals = getMatrixRow19Values(r);
    sumNlcBiet += vals.nlc.biet;
    sumNlcHieu += vals.nlc.hieu;
    sumNlcVanDung += vals.nlc.vanDung;

    sumDsBiet += vals.ds.biet;
    sumDsHieu += vals.ds.hieu;
    sumDsVanDung += vals.ds.vanDung;

    sumTlnBiet += vals.tln.biet;
    sumTlnHieu += vals.tln.hieu;
    sumTlnVanDung += vals.tln.vanDung;

    sumTlBiet += vals.tl.biet;
    sumTlHieu += vals.tl.hieu;
    // Look at whether row has vanDungCao specifically
    const vdcCount = r.vanDungCao?.tl || 0;
    const vdCount = Math.max(0, vals.tl.vanDung - vdcCount);
    sumTlVanDung += vdCount;
    sumTlVanDungCao += vdcCount;

    grandScore += vals.score;
  });

  const totalNlc = sumNlcBiet + sumNlcHieu + sumNlcVanDung;
  const totalDs = sumDsBiet + sumDsHieu + sumDsVanDung;
  const totalTln = sumTlnBiet + sumTlnHieu + sumTlnVanDung;
  const totalTl = sumTlBiet + sumTlHieu + sumTlVanDung + sumTlVanDungCao;
  const grandTotalQuestions = totalNlc + totalDs + totalTln + totalTl;

  const scoreNlc = Number((totalNlc * 0.25).toFixed(2));
  const scoreDs = Number((totalDs * 1.0).toFixed(2));
  const scoreTln = Number((totalTln * 0.5).toFixed(2));
  const scoreTl = Number((totalTl * 1.0).toFixed(2));

  const safeGrand = grandScore > 0 ? grandScore : 10;
  const pctNlc = Math.round((scoreNlc / safeGrand) * 100);
  const pctDs = Math.round((scoreDs / safeGrand) * 100);
  const pctTln = Math.round((scoreTln / safeGrand) * 100);
  const pctTl = Math.round((scoreTl / safeGrand) * 100);

  const scoreBiet = Number((sumNlcBiet * 0.25 + sumDsBiet * 1.0 + sumTlnBiet * 0.5 + sumTlBiet * 1.0).toFixed(2));
  const scoreHieu = Number((sumNlcHieu * 0.25 + sumDsHieu * 1.0 + sumTlnHieu * 0.5 + sumTlHieu * 1.0).toFixed(2));
  const scoreVD = Number((sumNlcVanDung * 0.25 + sumDsVanDung * 1.0 + sumTlnVanDung * 0.5 + sumTlVanDung * 1.0).toFixed(2));
  const scoreVDC = Number((sumTlVanDungCao * 1.0).toFixed(2));

  const pctBiet = Math.round((scoreBiet / safeGrand) * 100);
  const pctHieu = Math.round((scoreHieu / safeGrand) * 100);
  const pctVanDung = Math.round((scoreVD / safeGrand) * 100);
  const pctVanDungCao = Math.round((scoreVDC / safeGrand) * 100);

  const roundedGrandScore = Number(grandScore.toFixed(1));
  const isBalanced = Math.abs(roundedGrandScore - 10.0) < 0.01;
  const hasZeroFormat = totalNlc === 0 || totalDs === 0 || totalTln === 0 || totalTl === 0;

  return {
    totalNlc,
    totalDs,
    totalTln,
    totalTl,
    grandTotalQuestions,
    scoreNlc,
    scoreDs,
    scoreTln,
    scoreTl,
    pctNlc,
    pctDs,
    pctTln,
    pctTl,
    scoreBiet,
    scoreHieu,
    scoreVanDung: scoreVD,
    scoreVanDungCao: scoreVDC,
    pctBiet,
    pctHieu,
    pctVanDung,
    pctVanDungCao,
    grandScore: roundedGrandScore,
    isBalanced,
    hasZeroFormat,
  };
}

/**
 * Đảm bảo đồng bộ giữa cấu trúc 19 cột (nhieuLuaChon, dungSai, traLoiNgan, tuLuan)
 * và cấu trúc cấp độ nhận thức (nhanBiet, thongHieu, vanDung, vanDungCao)
 */
export function syncRowScores(r: MatrixRow): MatrixRow {
  const nlcBiet = r.nhieuLuaChon?.biet ?? r.nhanBiet?.tn1 ?? 0;
  const nlcHieu = r.nhieuLuaChon?.hieu ?? r.thongHieu?.tn1 ?? 0;
  const nlcVd = r.nhieuLuaChon?.vanDung ?? 0;

  const dsBiet = r.dungSai?.biet ?? r.nhanBiet?.tn2 ?? 0;
  const dsHieu = r.dungSai?.hieu ?? r.thongHieu?.tn2 ?? 0;
  const dsVd = r.dungSai?.vanDung ?? 0;

  const tlnBiet = r.traLoiNgan?.biet ?? r.nhanBiet?.tn3 ?? 0;
  const tlnHieu = r.traLoiNgan?.hieu ?? r.thongHieu?.tn3 ?? 0;
  const tlnVd = r.traLoiNgan?.vanDung ?? 0;

  const tlBiet = r.tuLuan?.biet ?? r.nhanBiet?.tl ?? 0;
  const tlHieu = r.tuLuan?.hieu ?? r.thongHieu?.tl ?? 0;
  const tlVd = r.tuLuan?.vanDung ?? (r.vanDung?.tl || 0);

  // Preserve existing VDC split if set
  const currentVdc = r.vanDungCao?.tl || 0;
  const effectiveVdc = Math.min(currentVdc, tlVd);
  const effectiveVd = tlVd - effectiveVdc;

  return {
    ...r,
    nhieuLuaChon: { biet: nlcBiet, hieu: nlcHieu, vanDung: nlcVd },
    dungSai: { biet: dsBiet, hieu: dsHieu, vanDung: dsVd },
    traLoiNgan: { biet: tlnBiet, hieu: tlnHieu, vanDung: tlnVd },
    tuLuan: { biet: tlBiet, hieu: tlHieu, vanDung: tlVd },
    nhanBiet: {
      tn: nlcBiet + dsBiet + tlnBiet,
      tl: tlBiet,
      tn1: nlcBiet,
      tn2: dsBiet,
      tn3: tlnBiet,
    },
    thongHieu: {
      tn: nlcHieu + dsHieu + tlnHieu,
      tl: tlHieu,
      tn1: nlcHieu,
      tn2: dsHieu,
      tn3: tlnHieu,
    },
    vanDung: {
      tn: nlcVd + dsVd + tlnVd,
      tl: effectiveVd,
      tn1: nlcVd,
      tn2: dsVd,
      tn3: tlnVd,
    },
    vanDungCao: {
      tn: 0,
      tl: effectiveVdc,
      tn1: 0,
      tn2: 0,
      tn3: 0,
    },
  };
}

/**
 * Tự động cân bằng ma trận khi người dùng chỉnh sửa một ô:
 * "khi tăng câu hỏi phần này thì sẽ tự động bớt câu hỏi phần khác, tương tự cho phần điểm số"
 * - Luôn bảo vệ: Không để bất kỳ dạng trắc nghiệm nào rơi vào 0%
 * - Ưu tiên duy trì tổng điểm 10.0 và bảo toàn mức độ nhận thức
 */
export function rebalanceMatrixWhenCellEdited(
  rows: MatrixRow[],
  targetRowId: string,
  part: 'nhieuLuaChon' | 'dungSai' | 'traLoiNgan' | 'tuLuan',
  level: 'biet' | 'hieu' | 'vanDung',
  newVal: number
): MatrixRow[] {
  const safeNewVal = Math.max(0, newVal);
  const targetRow = rows.find((r) => r.id === targetRowId);
  if (!targetRow) return rows;

  const currentPart = targetRow[part] || { biet: 0, hieu: 0, vanDung: 0 };
  const oldVal = currentPart[level] || 0;
  const delta = safeNewVal - oldVal;
  if (delta === 0) return rows;

  // Clone rows to avoid mutation
  const newRows = rows.map((r) => {
    const clone = { ...r };
    if (r.id === targetRowId) {
      clone[part] = {
        ...(r[part] || { biet: 0, hieu: 0, vanDung: 0 }),
        [level]: safeNewVal,
      };
    }
    return syncRowScores(clone);
  });

  // Calculate current totals across the whole matrix
  let stats = calculateMatrixTotals(newRows);

  if (delta > 0) {
    // USER INCREASED: We need to reduce `delta` questions elsewhere to keep balance
    let remainingToReduce = delta;

    // Phase 1: Try reducing from other rows of the SAME question type and SAME cognitive level
    for (let i = 0; i < newRows.length; i++) {
      if (remainingToReduce <= 0) break;
      if (newRows[i].id === targetRowId) continue;

      const pObj = newRows[i][part] || { biet: 0, hieu: 0, vanDung: 0 };
      const available = pObj[level] || 0;
      if (available > 0) {
        // Check if reducing this would empty the entire part in the matrix
        const partTotalInMatrix = stats[part === 'nhieuLuaChon' ? 'totalNlc' : part === 'dungSai' ? 'totalDs' : part === 'traLoiNgan' ? 'totalTln' : 'totalTl'];
        const canTake = Math.min(remainingToReduce, available);
        if (partTotalInMatrix - canTake >= 1) {
          pObj[level] -= canTake;
          remainingToReduce -= canTake;
          newRows[i][part] = { ...pObj };
          newRows[i] = syncRowScores(newRows[i]);
          stats = calculateMatrixTotals(newRows);
        }
      }
    }

    // Phase 2: If still remaining, try reducing from other rows of the SAME question type at other levels
    if (remainingToReduce > 0) {
      const otherLevels: ('biet' | 'hieu' | 'vanDung')[] = ['biet', 'hieu', 'vanDung'].filter((l) => l !== level) as any;
      for (const otherLvl of otherLevels) {
        if (remainingToReduce <= 0) break;
        for (let i = 0; i < newRows.length; i++) {
          if (remainingToReduce <= 0) break;
          if (newRows[i].id === targetRowId) continue;

          const pObj = newRows[i][part] || { biet: 0, hieu: 0, vanDung: 0 };
          const available = pObj[otherLvl] || 0;
          if (available > 0) {
            const partTotalInMatrix = stats[part === 'nhieuLuaChon' ? 'totalNlc' : part === 'dungSai' ? 'totalDs' : part === 'traLoiNgan' ? 'totalTln' : 'totalTl'];
            const canTake = Math.min(remainingToReduce, available);
            if (partTotalInMatrix - canTake >= 1) {
              pObj[otherLvl] -= canTake;
              remainingToReduce -= canTake;
              newRows[i][part] = { ...pObj };
              newRows[i] = syncRowScores(newRows[i]);
              stats = calculateMatrixTotals(newRows);
            }
          }
        }
      }
    }

    // Phase 3: If still remaining (e.g. only 1 row or other rows empty), reduce from other question types with point equivalence
    if (remainingToReduce > 0) {
      // Points per question: NLC = 0.25, DS = 1.0, TLN = 0.5, TL = 1.0
      const scorePerItem: Record<string, number> = {
        nhieuLuaChon: 0.25,
        dungSai: 1.0,
        traLoiNgan: 0.5,
        tuLuan: 1.0,
      };
      const addedPoints = remainingToReduce * scorePerItem[part];
      let pointsToDeduct = addedPoints;

      const otherParts: ('nhieuLuaChon' | 'dungSai' | 'traLoiNgan' | 'tuLuan')[] = ['nhieuLuaChon', 'dungSai', 'traLoiNgan', 'tuLuan'].filter((p) => p !== part) as any;
      for (const oPart of otherParts) {
        if (pointsToDeduct <= 0.05) break;
        const oScorePerItem = scorePerItem[oPart];

        for (let i = 0; i < newRows.length; i++) {
          if (pointsToDeduct <= 0.05) break;
          const pObj = newRows[i][oPart] || { biet: 0, hieu: 0, vanDung: 0 };

          for (const lvl of ['biet', 'hieu', 'vanDung'] as const) {
            if (pointsToDeduct <= 0.05) break;
            if (pObj[lvl] > 0) {
              const partTotalInMatrix = stats[oPart === 'nhieuLuaChon' ? 'totalNlc' : oPart === 'dungSai' ? 'totalDs' : oPart === 'traLoiNgan' ? 'totalTln' : 'totalTl'];
              // DO NOT allow dropping to 0%
              if (partTotalInMatrix > 1) {
                pObj[lvl] -= 1;
                pointsToDeduct -= oScorePerItem;
                newRows[i][oPart] = { ...pObj };
                newRows[i] = syncRowScores(newRows[i]);
                stats = calculateMatrixTotals(newRows);
              }
            }
          }
        }
      }
    }
  } else {
    // USER DECREASED: We need to compensate by adding `|delta|` elsewhere
    const toCompensate = Math.abs(delta);
    // Find the row with highest periods/teaching hours to add
    let bestRowIdx = 0;
    let maxPeriods = -1;
    newRows.forEach((r, idx) => {
      if (r.id !== targetRowId && (r.soTiet || 0) > maxPeriods) {
        maxPeriods = r.soTiet || 0;
        bestRowIdx = idx;
      }
    });

    const pObj = newRows[bestRowIdx][part] || { biet: 0, hieu: 0, vanDung: 0 };
    pObj[level] = (pObj[level] || 0) + toCompensate;
    newRows[bestRowIdx][part] = { ...pObj };
    newRows[bestRowIdx] = syncRowScores(newRows[bestRowIdx]);
  }

  // Ensure no format has 0 questions
  return ensureNoZeroFormat(newRows);
}

/**
 * Đảm bảo mọi dạng trắc nghiệm (I, II, III) và tự luận (IV) đều có ít nhất 1 câu (không bao giờ 0%)
 */
export function ensureNoZeroFormat(rows: MatrixRow[]): MatrixRow[] {
  if (rows.length === 0) return rows;
  const stats = calculateMatrixTotals(rows);
  if (!stats.hasZeroFormat) return rows;

  const newRows = rows.map((r) => syncRowScores({ ...r }));

  // Helper to add 1 question to a format
  const addOne = (part: 'nhieuLuaChon' | 'dungSai' | 'traLoiNgan' | 'tuLuan', lvl: 'biet' | 'hieu' | 'vanDung') => {
    const targetIdx = 0;
    const pObj = newRows[targetIdx][part] || { biet: 0, hieu: 0, vanDung: 0 };
    pObj[lvl] = (pObj[lvl] || 0) + 1;
    newRows[targetIdx][part] = { ...pObj };
    newRows[targetIdx] = syncRowScores(newRows[targetIdx]);
  };

  if (stats.totalNlc === 0) addOne('nhieuLuaChon', 'biet');
  if (stats.totalDs === 0) addOne('dungSai', 'biet');
  if (stats.totalTln === 0) addOne('traLoiNgan', 'hieu');
  if (stats.totalTl === 0) addOne('tuLuan', 'vanDung');

  return newRows;
}

/**
 * Tự động cân bằng chuẩn Bộ Giáo dục & Đào tạo:
 * - Nhận biết: 30% (3,0 điểm)
 * - Thông hiểu: 40% (4,0 điểm)
 * - Vận dụng: 30% (3,0 điểm) [trong đó: Vận dụng 20% (2,0 điểm) và Vận dụng cao 10% (1,0 điểm)]
 * - Cả 4 dạng:
 *   + Dạng I: 12 câu nhiều lựa chọn = 3,0đ (30%)
 *   + Dạng II: 2 câu Đúng/Sai = 2,0đ (20%)
 *   + Dạng III: 4 câu Trả lời ngắn = 2,0đ (20%)
 *   + Dạng IV: 3 bài Tự luận = 3,0đ (30%)
 * - Phân bố đa dạng xen kẽ trên các dòng
 */
export function resetToStandardMoetMatrix(rows: MatrixRow[]): MatrixRow[] {
  if (rows.length === 0) return rows;

  const N = rows.length;
  const totalPeriods = rows.reduce((sum, r) => sum + (r.soTiet || 2), 0) || 1;

  // Target Counts for standard 10.0 points
  // D1: 6 NB, 6 TH
  // D2: 1 NB, 1 TH
  // D3: 1 NB, 3 TH
  // TL: 2 VD, 1 VDC

  let remD1_NB = 6;
  let remD1_TH = 6;
  let remD2_NB = 1;
  let remD2_TH = 1;
  let remD3_NB = 1;
  let remD3_TH = 3;
  let remTL_VD = 2;
  let remTL_VDC = 1;

  // Map units to receive D2 and D3 diversely
  // D2 should be placed on 2 different topics
  const d2_nb_row_idx = 0;
  const d2_th_row_idx = N > 1 ? Math.min(N - 1, Math.floor(N / 2)) : 0;

  // D3 should be placed across diverse topics
  const d3_slots: { rowIdx: number; level: 'biet' | 'hieu' }[] = [];
  if (N >= 4) {
    d3_slots.push({ rowIdx: 1 % N, level: 'biet' });
    d3_slots.push({ rowIdx: 2 % N, level: 'hieu' });
    d3_slots.push({ rowIdx: (N - 1) % N, level: 'hieu' });
    d3_slots.push({ rowIdx: 3 % N, level: 'hieu' });
  } else {
    for (let i = 0; i < 4; i++) {
      d3_slots.push({ rowIdx: i % N, level: i === 0 ? 'biet' : 'hieu' });
    }
  }

  // TL should be placed on major topics and last topic
  const tl_vd_rows = [N > 1 ? Math.floor(N / 2) : 0, 0];
  const tl_vdc_row = N - 1;

  return rows.map((r, idx) => {
    const isLast = idx === N - 1;
    const periods = r.soTiet || 2;
    const weight = periods / totalPeriods;

    // 1. Dạng I (Nhiều lựa chọn - 12 câu: 6 NB, 6 TH)
    let d1_nb = isLast ? remD1_NB : Math.min(remD1_NB, Math.max(0, Math.round(weight * 6)));
    if (d1_nb < 0) d1_nb = 0;
    remD1_NB -= d1_nb;

    let d1_th = isLast ? remD1_TH : Math.min(remD1_TH, Math.max(0, Math.round(weight * 6)));
    if (d1_th < 0) d1_th = 0;
    remD1_TH -= d1_th;

    // 2. Dạng II (Đúng - Sai - 2 câu: 1 NB, 1 TH)
    let d2_nb = 0;
    if (idx === d2_nb_row_idx && remD2_NB > 0) {
      d2_nb = 1;
      remD2_NB -= 1;
    } else if (isLast && remD2_NB > 0) {
      d2_nb = remD2_NB;
      remD2_NB = 0;
    }

    let d2_th = 0;
    if (idx === d2_th_row_idx && remD2_TH > 0) {
      d2_th = 1;
      remD2_TH -= 1;
    } else if (isLast && remD2_TH > 0) {
      d2_th = remD2_TH;
      remD2_TH = 0;
    }

    // 3. Dạng III (Trả lời ngắn - 4 câu: 1 NB, 3 TH)
    let d3_nb = 0;
    let d3_th = 0;
    d3_slots.forEach((slot) => {
      if (slot.rowIdx === idx) {
        if (slot.level === 'biet' && remD3_NB > 0) {
          d3_nb += 1;
          remD3_NB -= 1;
        } else if (slot.level === 'hieu' && remD3_TH > 0) {
          d3_th += 1;
          remD3_TH -= 1;
        }
      }
    });

    if (isLast) {
      if (remD3_NB > 0) {
        d3_nb += remD3_NB;
        remD3_NB = 0;
      }
      if (remD3_TH > 0) {
        d3_th += remD3_TH;
        remD3_TH = 0;
      }
    }

    // 4. Dạng IV (Tự luận - 3 bài: 2 VD, 1 VDC)
    let tl_vd = 0;
    if (tl_vd_rows.includes(idx) && remTL_VD > 0) {
      tl_vd = 1;
      remTL_VD -= 1;
    } else if (isLast && remTL_VD > 0) {
      tl_vd = remTL_VD;
      remTL_VD = 0;
    }

    let tl_vdc = 0;
    if (idx === tl_vdc_row && remTL_VDC > 0) {
      tl_vdc = 1;
      remTL_VDC -= 1;
    } else if (isLast && remTL_VDC > 0) {
      tl_vdc = remTL_VDC;
      remTL_VDC = 0;
    }

    const updatedRow: MatrixRow = {
      ...r,
      nhieuLuaChon: { biet: d1_nb, hieu: d1_th, vanDung: 0 },
      dungSai: { biet: d2_nb, hieu: d2_th, vanDung: 0 },
      traLoiNgan: { biet: d3_nb, hieu: d3_th, vanDung: 0 },
      tuLuan: { biet: 0, hieu: 0, vanDung: tl_vd + tl_vdc },
      nhanBiet: {
        tn: d1_nb + d2_nb + d3_nb,
        tl: 0,
        tn1: d1_nb,
        tn2: d2_nb,
        tn3: d3_nb,
      },
      thongHieu: {
        tn: d1_th + d2_th + d3_th,
        tl: 0,
        tn1: d1_th,
        tn2: d2_th,
        tn3: d3_th,
      },
      vanDung: {
        tn: 0,
        tl: tl_vd,
        tn1: 0,
        tn2: 0,
        tn3: 0,
      },
      vanDungCao: {
        tn: 0,
        tl: tl_vdc,
        tn1: 0,
        tn2: 0,
        tn3: 0,
      },
    };

    return updatedRow;
  });
}

/**
 * Tăng hoặc giảm số câu của một dạng (NLC, DS, TLN, TL) từ thanh điều khiển
 * và tự động bù trừ tương ứng ở dạng khác để tổng điểm luôn bảo toàn = 10.0 điểm
 */
export function adjustFormatQuestions(
  rows: MatrixRow[],
  format: 'nlc' | 'ds' | 'tln' | 'tl',
  delta: number
): MatrixRow[] {
  if (rows.length === 0 || delta === 0) return rows;

  const stats = calculateMatrixTotals(rows);
  const newRows = rows.map((r) => syncRowScores({ ...r }));

  // Helper to add questions to format
  const addQuestions = (fmt: 'nlc' | 'ds' | 'tln' | 'tl', count: number) => {
    // Distribute across rows
    let rem = count;
    for (let i = 0; i < newRows.length && rem > 0; i++) {
      const partKey = fmt === 'nlc' ? 'nhieuLuaChon' : fmt === 'ds' ? 'dungSai' : fmt === 'tln' ? 'traLoiNgan' : 'tuLuan';
      const pObj = newRows[i][partKey] || { biet: 0, hieu: 0, vanDung: 0 };
      // add into hieu or biet
      pObj.hieu = (pObj.hieu || 0) + 1;
      newRows[i][partKey] = { ...pObj };
      newRows[i] = syncRowScores(newRows[i]);
      rem--;
    }
  };

  // Helper to remove questions from format
  const removeQuestions = (fmt: 'nlc' | 'ds' | 'tln' | 'tl', count: number) => {
    let rem = count;
    const partKey = fmt === 'nlc' ? 'nhieuLuaChon' : fmt === 'ds' ? 'dungSai' : fmt === 'tln' ? 'traLoiNgan' : 'tuLuan';
    for (let i = newRows.length - 1; i >= 0 && rem > 0; i--) {
      const pObj = newRows[i][partKey] || { biet: 0, hieu: 0, vanDung: 0 };
      for (const lvl of ['hieu', 'biet', 'vanDung'] as const) {
        if (rem <= 0) break;
        if (pObj[lvl] > 0) {
          pObj[lvl] -= 1;
          rem--;
        }
      }
      newRows[i][partKey] = { ...pObj };
      newRows[i] = syncRowScores(newRows[i]);
    }
  };

  if (delta > 0) {
    // Tăng format này
    if (format === 'ds') {
      // +1 câu Đúng/Sai (+1.0đ) -> Bớt 4 câu NLC (-1.0đ) hoặc 2 câu TLN (-1.0đ)
      if (stats.totalNlc >= 5) {
        addQuestions('ds', 1);
        removeQuestions('nlc', 4);
      } else if (stats.totalTln >= 3) {
        addQuestions('ds', 1);
        removeQuestions('tln', 2);
      } else if (stats.totalTl >= 2) {
        addQuestions('ds', 1);
        removeQuestions('tl', 1);
      }
    } else if (format === 'tln') {
      // +2 câu Trả lời ngắn (+1.0đ) hoặc +1 câu (+0.5đ) -> bớt 2 câu NLC (-0.5đ)
      if (stats.totalNlc >= 3) {
        addQuestions('tln', 1);
        removeQuestions('nlc', 2);
      } else if (stats.totalDs >= 2) {
        addQuestions('tln', 2);
        removeQuestions('ds', 1);
      }
    } else if (format === 'nlc') {
      // +2 câu NLC (+0.5đ) -> bớt 1 câu TLN (-0.5đ)
      if (stats.totalTln >= 2) {
        addQuestions('nlc', 2);
        removeQuestions('tln', 1);
      } else if (stats.totalDs >= 2) {
        addQuestions('nlc', 4);
        removeQuestions('ds', 1);
      }
    } else if (format === 'tl') {
      // +1 câu TL (+1.0đ) -> bớt 4 câu NLC (-1.0đ)
      if (stats.totalNlc >= 5) {
        addQuestions('tl', 1);
        removeQuestions('nlc', 4);
      } else if (stats.totalDs >= 2) {
        addQuestions('tl', 1);
        removeQuestions('ds', 1);
      }
    }
  } else {
    // Giảm format này
    if (format === 'ds' && stats.totalDs > 1) {
      // -1 câu Đúng/Sai (-1.0đ) -> Tăng 4 câu NLC (+1.0đ)
      removeQuestions('ds', 1);
      addQuestions('nlc', 4);
    } else if (format === 'tln' && stats.totalTln > 1) {
      // -1 câu TLN (-0.5đ) -> Tăng 2 câu NLC (+0.5đ)
      removeQuestions('tln', 1);
      addQuestions('nlc', 2);
    } else if (format === 'nlc' && stats.totalNlc > 2) {
      // -2 câu NLC (-0.5đ) -> Tăng 1 câu TLN (+0.5đ)
      removeQuestions('nlc', 2);
      addQuestions('tln', 1);
    } else if (format === 'tl' && stats.totalTl > 1) {
      // -1 câu TL (-1.0đ) -> Tăng 4 câu NLC (+1.0đ)
      removeQuestions('tl', 1);
      addQuestions('nlc', 4);
    }
  }

  return ensureNoZeroFormat(newRows);
}
