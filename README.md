# AntForge · 兰顿蚂蚁锻造炉

单文件、零依赖、可离线运行的**兰顿蚂蚁（Langton's ant）**元胞自动机锻造工具。

- 空网格实况演化：白格→右转并染黑；黑格→左转并染白
- 约 1 万步后必现「公路」——周期 104 的恒定斜向位移（混沌→有序的经典涌现）
- 相机自动跟随蚂蚁，可调速播放 / 单步 / 跳到 highway
- 内置自检：单步规则、确定性、**可逆 CA**（前向再后向精确还原）、黑格数序列、公路周期
- 纯 JS 引擎，无外部依赖，打开 `index.html` 即用

## 引擎不变量

| 量 | 值 | 说明 |
|----|----|------|
| 单步规则 | 白→右转+染黑；黑→左转+染白 | Langton 1926 |
| 前 5 步黑格数 | `1,2,3,4,3` | 空网格起点 |
| 可逆性 | `stepBack(step(state)) == state` | 8 个随机初始态验证 |
| 公路周期 | 104 步恒定斜向位移 `(±2,∓2)` | 11000 步后涌现 |

## 本地校验

```bash
node _smoke.js   # 8 项不变量测试
node _probe.js   # ASCII 渲染 + 黑格数序列 + 公路探针
```

## 引擎接口

```js
const Ant = require('./index.html'); // 浏览器内为全局 const Ant
Ant.makeState();                      // -> { blacks:Set("x,y"), x:0, y:0, dir:0 }
Ant.step(s);                          // 前向一步（原地修改）
Ant.stepBack(s);                      // 精确逆操作（无历史栈）
Ant.run(s, n);                        // 连续 n 步
Ant.hash(s);                          // 确定性状态指纹
```

## 许可证

MIT — 见 [LICENSE](./LICENSE)。
