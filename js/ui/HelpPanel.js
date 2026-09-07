'use strict';

const UISystem = require('./UISystem');

function buildSections(rewardWord) {
  return [
  { type: 'title', text: '玩法说明' },
  { type: 'lead', text: '目标：把木板上的螺丝拧下来，放进底部暂存槽，凑齐 3 个相同颜色自动消除。把所有木板上的螺丝全部拧下，即可过关。' },

  { type: 'h', text: '一、游戏目标' },
  { type: 'bullet', text: '观察木板上螺丝的颜色' },
  { type: 'bullet', text: '点击可拆的螺丝，它会飞进底部暂存槽' },
  { type: 'bullet', text: '暂存槽里凑齐 3 个同色螺丝，自动消除' },
  { type: 'bullet', text: '所有螺丝从木板上拧下，关卡胜利' },
  { type: 'bullet', text: '暂存槽满且凑不出 3 个同色，则失败' },

  { type: 'h', text: '二、基本操作' },
  { type: 'bullet', text: '旋转视角：单指滑动屏幕，从不同角度观察木板和螺丝' },
  { type: 'bullet', text: '放大缩小：双指捏合或张开，看清螺丝位置' },
  { type: 'bullet', text: '拧下螺丝：点击没有被挡住的螺丝，它会飞入暂存槽' },
  { type: 'bullet', text: '三消：暂存槽中同色螺丝满 3 个自动消除' },

  { type: 'h', text: '三、新手 5 步玩法' },
  { type: 'bullet', text: '1. 先看颜色：进入关卡后，先转动视角，看看木板上有哪些颜色的螺丝' },
  { type: 'bullet', text: '2. 找最外层螺丝：优先点击没有被其他木板挡住的螺丝' },
  { type: 'bullet', text: '3. 放进暂存槽：点击螺丝后，它会进入屏幕底部的暂存槽' },
  { type: 'bullet', text: '4. 凑齐 3 个同色：暂存槽里出现 3 个相同颜色就会自动消除' },
  { type: 'bullet', text: '5. 清完过关：木板的螺丝全部拧下后木板会落下，所有木板拆完即胜利' },

  { type: 'h', text: '四、胜利和失败' },
  { type: 'text', text: '胜利：所有木板上的螺丝都被拧下，木板逐块落下，关卡完成（暂存槽里剩余的螺丝不影响过关）。' },
  { type: 'text', text: '失败：暂存槽已满，且没有 3 个相同颜色。失败后可以重试，也可以' + rewardWord + '「撤回一步」或「移出 3 颗螺丝」继续。' },

  { type: 'h', text: '五、简单策略' },
  { type: 'bullet', text: '先消数量多的颜色：数量多的颜色优先处理，更容易凑齐 3 个' },
  { type: 'bullet', text: '优先点外层螺丝：先拆最外面、最上层的螺丝，木板拆掉后才会露出下面的螺丝' },
  { type: 'bullet', text: '不要乱点同一种颜色：暂存槽已有 2 个蓝色时，点第 3 个蓝色会立刻消除；乱点其他颜色会让槽更快变满' },
  { type: 'bullet', text: '卡住时转动视角：螺丝可能被木板挡住，滑动屏幕旋转视角，找到真正可以点的螺丝' },
  { type: 'bullet', text: '善用上方的撤销按钮：点错了可以撤回一步' },
  { type: 'bullet', text: '金币很有用：通关赚金币，可买提示和撤销，失败时也能花金币撤回' },

  { type: 'h', text: '六、一句话记住玩法' },
  { type: 'lead', text: '转动视角找螺丝，点击螺丝进槽，3 个同色自动消除，清完所有螺丝就过关。' }
  ];
}

const FONT = {
  title: 19,
  h: 15,
  body: 13,
  lead: 13
};
const LINE_H = { title: 30, h: 27, body: 20, lead: 20 };

function wrapText(text, maxChars) {
  const lines = [];
  let rest = text;
  while (rest.length > maxChars) {
    lines.push(rest.slice(0, maxChars));
    rest = rest.slice(maxChars);
  }
  if (rest.length > 0) lines.push(rest);
  return lines;
}

class HelpPanel {
  constructor(screenW, screenH, capsule, opts) {
    this.sections = buildSections((opts && opts.rewardWord) || '看视频');
    this.w = screenW;
    this.h = screenH;
    this.capsule = capsule || { top: 26, height: 32, bottom: 58 };
    this.visible = false;
    this.animT = 0;
    this.scroll = 0;
    this.maxScroll = 0;
    this.vel = 0;
    this.dragging = false;
    this.blocks = [];
    this.closeBtn = { x: 0, y: 0, r: 15 };
    this.panel = { x: 0, y: 0, w: 0, h: 0 };
    this._layoutStatic();
  }

  resize(w, h) {
    this.w = w;
    this.h = h;
    this._layoutStatic();
  }

  _layoutStatic() {
    const margin = 18;
    const px = margin;
    const pw = this.w - margin * 2;
    const py = this.capsule.bottom + 10;
    const ph = this.h - py - 16;
    this.panel = { x: px, y: py, w: pw, h: ph };

    this.closeBtn = { x: px + pw - 24, y: py + 24, r: 15 };

    const innerPadX = 16;
    const bulletIndent = 10;
    const bodyChars = Math.max(8, Math.floor((pw - innerPadX * 2) / FONT.body));
    const bulletChars = Math.max(8, Math.floor((pw - innerPadX * 2 - bulletIndent) / FONT.body));
    const titleChars = Math.max(8, Math.floor((pw - innerPadX * 2) / FONT.title));

    let y = innerPadX;
    this.blocks = [];
    for (let i = 0; i < this.sections.length; i++) {
      const s = this.sections[i];
      const isBullet = s.type === 'bullet';
      const isTitle = s.type === 'title';
      const isH = s.type === 'h';
      const fontSize = isTitle ? FONT.title : (isH ? FONT.h : FONT.body);
      const maxChars = isTitle ? titleChars : (isBullet ? bulletChars : bodyChars);
      const lines = wrapText(s.text, maxChars);
      for (let l = 0; l < lines.length; l++) {
        this.blocks.push({
          type: s.type,
          text: (isBullet && l === 0 ? '· ' : '') + lines[l],
          y: y,
          fontSize: fontSize,
          bold: isTitle || isH
        });
        y += LINE_H[isTitle ? 'title' : (isH ? 'h' : (s.type === 'lead' ? 'lead' : 'body'))];
      }
      y += isH ? 4 : (isTitle ? 6 : 3);
    }
    this.contentHeight = y + 48;
    this.maxScroll = Math.max(0, this.contentHeight - (ph - 8));
  }

  show() {
    this.visible = true;
    this.animT = 0;
    this.scroll = 0;
    this.vel = 0;
    this.dragging = false;
  }

  hide() {
    this.visible = false;
    this.vel = 0;
    this.dragging = false;
  }

  update(dt) {
    if (!this.visible) return;
    if (this.animT < 1) this.animT = Math.min(1, this.animT + dt / 0.25);
    if (!this.dragging && Math.abs(this.vel) > 0.2) {
      const frames = Math.max(0.001, dt * 60);
      this.scroll = Math.max(0, Math.min(this.maxScroll, this.scroll + this.vel * frames));
      this.vel *= Math.pow(0.92, frames);
      if (this.scroll === 0 || this.scroll === this.maxScroll) this.vel = 0;
    }
  }

  onDrag(dy) {
    if (!this.visible) return;
    this.dragging = true;
    this.vel = 0.7 * this.vel + 0.3 * (-dy);
    this.scroll = Math.max(0, Math.min(this.maxScroll, this.scroll - dy));
  }

  onDragEnd(vy) {
    if (!this.visible) return;
    this.dragging = false;
    this.vel = Math.max(-60, Math.min(60, -(vy || 0)));
  }

  hitTest(x, y) {
    if (!this.visible) return null;
    const c = this.closeBtn;
    const dx = x - c.x;
    const dyy = y - c.y;
    if (dx * dx + dyy * dyy <= (c.r + 8) * (c.r + 8)) return 'close';
    return 'panel';
  }

  draw(ctx) {
    if (!this.visible) return;
    const p = this.panel;
    const ease = 1 - Math.pow(1 - this.animT, 3);

    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,' + (0.5 * ease) + ')';
    ctx.fillRect(0, 0, this.w, this.h);

    ctx.globalAlpha = ease;

    UISystem.roundRect(ctx, p.x, p.y, p.w, p.h, 18);
    ctx.fillStyle = '#ffffff';
    ctx.fill();

    ctx.save();
    UISystem.roundRect(ctx, p.x, p.y, p.w, p.h, 18);
    ctx.clip();

    const textX = p.x + 16;
    const baseY = p.y + 14 - this.scroll;
    ctx.textAlign = 'left';
    for (let i = 0; i < this.blocks.length; i++) {
      const b = this.blocks[i];
      const ly = baseY + b.y;
      if (ly > p.y + p.h + 4 || ly < p.y - 24) continue;
      ctx.font = (b.bold ? 'bold ' : '') + b.fontSize + 'px sans-serif';
      if (b.type === 'title') ctx.fillStyle = '#1f2d3d';
      else if (b.type === 'h') ctx.fillStyle = '#e67e22';
      else if (b.type === 'lead') ctx.fillStyle = '#34495e';
      else ctx.fillStyle = '#4a5866';
      ctx.fillText(b.text, textX + (b.type === 'bullet' ? 4 : 0), ly + b.fontSize);
    }

    if (this.maxScroll > 0) {
      const fadeTop = Math.min(1, this.scroll / 12);
      const fadeBot = Math.min(1, (this.maxScroll - this.scroll) / 12);
      if (fadeTop > 0) {
        const g = ctx.createLinearGradient(0, p.y, 0, p.y + 26);
        g.addColorStop(0, 'rgba(255,255,255,' + fadeTop + ')');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(p.x, p.y, p.w, 26);
      }
      if (fadeBot > 0) {
        const g = ctx.createLinearGradient(0, p.y + p.h - 26, 0, p.y + p.h);
        g.addColorStop(0, 'rgba(255,255,255,0)');
        g.addColorStop(1, 'rgba(255,255,255,' + fadeBot + ')');
        ctx.fillStyle = g;
        ctx.fillRect(p.x, p.y + p.h - 26, p.w, 26);
      }
    }
    ctx.restore();

    const c = this.closeBtn;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fillStyle = '#2c3e50';
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(c.x - 5, c.y - 5);
    ctx.lineTo(c.x + 5, c.y + 5);
    ctx.moveTo(c.x + 5, c.y - 5);
    ctx.lineTo(c.x - 5, c.y + 5);
    ctx.stroke();

    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

module.exports = HelpPanel;
