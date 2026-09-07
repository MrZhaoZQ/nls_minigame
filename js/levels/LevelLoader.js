'use strict';

const SGNode = require('../render/SceneGraph').SGNode;
const MeshBuilder = require('../render/MeshBuilder');
const GameConfig = require('../config/GameConfig');

const DEG = Math.PI / 180;

function buildBoardMesh(prefab) {
  const b = GameConfig.board;
  switch (prefab) {
    case 'Board_L':
      return MeshBuilder.buildLBoardMesh(b.sizeL.w, b.sizeL.d, b.thickness, b.sizeL.h, 'wood', GameConfig.wood.main);
    case 'Board_Gear':
      return MeshBuilder.buildGearMesh(b.gearRadius, b.gearSegments, b.thickness, 'wood', GameConfig.wood.main);
    case 'Board_Single':
    default:
      return MeshBuilder.buildBoxMesh(b.width, b.depth, b.thickness, 'wood', GameConfig.wood.main);
  }
}

class LevelLoader {
  load(levelData, scene, screwManager) {
    const boards = [];
    const coverages = [];
    let screwSeq = 0;

    const boardIndex = {};
    for (let i = 0; i < levelData.boards.length; i++) {
      const bd = levelData.boards[i];
      boardIndex[bd.id] = bd;
    }

    for (let i = 0; i < levelData.boards.length; i++) {
      const bd = levelData.boards[i];
      const node = new SGNode('board_' + bd.id);
      node.position = bd.position.slice();
      if (bd.rotation) {
        node.setEulerXYZ(bd.rotation[0] * DEG, bd.rotation[1] * DEG, bd.rotation[2] * DEG);
      }
      if (bd.scale) node.scale = bd.scale;
      node.mesh = buildBoardMesh(bd.prefab || 'Board_Single');
      node.userData.isBoard = true;
      node.userData.boardId = bd.id;
      const he = node.mesh.halfExtents;
      const rad = ((bd.rotation && bd.rotation[1]) || 0) * Math.PI / 180;
      const c = Math.abs(Math.cos(rad));
      const s = Math.abs(Math.sin(rad));
      node.userData.fp = {
        hw: he[0] * c + he[2] * s,
        hd: he[0] * s + he[2] * c
      };
      scene.add(node);

      const holes = [];
      const boardEntry = { id: bd.id, node, holes, remaining: 0, def: bd };

      for (let j = 0; j < bd.holes.length; j++) {
        const hd = bd.holes[j];
        const holeNode = new SGNode('hole_' + bd.id + '_' + hd.id);
        holeNode.position = hd.pos.slice();
        node.addChild(holeNode);

        const screwNode = new SGNode('screw_' + (++screwSeq));
        const baseLocal = [0, GameConfig.board.thickness / 2, 0];
        screwNode.position = baseLocal.slice();
        screwNode.mesh = MeshBuilder.buildScrewMesh(hd.color);
        screwNode.userData.color = hd.color;
        holeNode.addChild(screwNode);

        const entry = screwManager.create(bd.id, hd.id, hd.color, screwNode, baseLocal);
        entry.holeNode = holeNode;
        entry.levelDef = hd;

        if (hd.coveredBy && hd.coveredBy.length > 0) {
          screwManager.setLocked(entry, true);
          coverages.push({ screw: entry, boards: hd.coveredBy.slice() });
        }

        holes.push({ id: hd.id, node: holeNode, screw: entry });
        boardEntry.remaining++;
      }

      boards.push(boardEntry);
    }

    const boardById = {};
    for (let i = 0; i < boards.length; i++) boardById[boards[i].id] = boards[i];

    return { boards, boardById, coverages, framing: this.computeFraming(boards) };
  }

  computeFraming(boards) {
    const min = [Infinity, Infinity, Infinity];
    const max = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < boards.length; i++) {
      const node = boards[i].node;
      const half = (node.mesh && node.mesh.halfExtents) || [1, 1, 1];
      node.computeWorld(999999);
      const wp = node._worldPos;
      for (let k = 0; k < 3; k++) {
        const extent = half[k] * node._effectiveScale();
        if (wp[k] - extent < min[k]) min[k] = wp[k] - extent;
        if (wp[k] + extent > max[k]) max[k] = wp[k] + extent;
      }
    }
    const pivot = [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];
    const radius = Math.max(
      max[0] - min[0],
      (max[1] - min[1]) * 2,
      max[2] - min[2]) / 2;
    return { pivot, radius: Math.max(1.5, radius) };
  }
}

module.exports = LevelLoader;
module.exports.buildBoardMesh = buildBoardMesh;
