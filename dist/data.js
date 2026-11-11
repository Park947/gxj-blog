"use strict";

window.GXJ_ARTICLES = [
  {
    slug: "ai-mv-agent-architecture", category: "AI Agent", date: "2026-06-10", visual: "graph", color: "cyan", label: "AGENT / ARCHITECTURE",
    title: "AI MV Agent 架构介绍与技术实现",
    summary: "从 FastAPI 到 LangGraph，拆解音乐 MV 生成 Agent 的状态编排、阶段守卫、专家节点与前端交互。",
    notes: ["先区分接口层、编排层和持久化层的责任。FastAPI 接收请求，LangGraph 组织工作流，数据库保留任务与阶段信息。", "对长流程显式设置阶段边界。一次模型调用成功，并不意味着任务已经具备进入下一阶段的全部条件。", "前端展示的 JSON 卡片应对应明确的业务状态，让用户能理解当前产物、待确认事项和下一步动作。"],
    checks: ["中途失败后能否恢复任务，而不重复执行已经确认的阶段？", "流式进度、数据库状态和前端卡片是否对同一个任务保持一致？"]
  },
  {
    slug: "langgraph-browser-use-test-agent", category: "AI 测试", date: "2026-05-18", visual: "type", color: "pink", label: "NATURAL LANGUAGE / TESTING", word: "TEST.", subline: "PLAN → EXECUTE → ASSERT",
    title: "LangGraph + browser-use：一个自然语言驱动的自动化测试 Agent 架构设计",
    summary: "让自然语言变成可执行的测试计划：以 LangGraph 管理状态，用 browser-use 操作真实浏览器。",
    notes: ["把测试目标理解、页面观察、计划生成、浏览器执行和结果判断拆为独立步骤，避免所有责任落在同一个提示词里。", "浏览器操作完成不等于断言成立。需要在执行器之外保留清晰的验收条件，并收集支持结论的页面证据。", "自然语言测试入口同样需要输入校验。目标含糊、URL 无效或任务超出能力边界时，应给出可理解的反馈。"],
    checks: ["页面结构发生变化时，计划是否仍然遵守原始测试目标？", "超时、导航失败和断言不满足，是否有不同的失败归因？"]
  },
  {
    slug: "agent-testing-blog", category: "AI 测试", date: "2026-05-13", visual: "grid", color: "dark", label: "STATE / SERVICE / ACCEPTANCE", word: "STATE",
    title: "LangGraph Agent 测试笔记：视频创作 Agent 的状态、任务与服务化验收",
    summary: "把状态机、异步任务、工具调用和流式输出放进同一个验收视角，检查 Agent 服务的完整行为。",
    notes: ["从状态迁移开始设计用例，覆盖正常推进、分支选择、用户确认和异常退出，而不是只检查最终文字。", "异步任务需要验证生命周期，包括创建、执行中、成功、失败与恢复。接口返回成功只说明请求被接收。", "服务化验收要贯穿后端任务和前端事件：任务标识一致、事件顺序合理、断线后有可查询的最终状态。"],
    checks: ["重复提交或连接中断后，是否会产生重复任务？", "工具失败是否准确写入任务状态，并通过接口反馈给用户？"]
  },
  {
    slug: "langsmith-testing-experience", category: "AI 测试", date: "2026-05-12", visual: "target", color: "lime", label: "TRACING / ROOT CAUSE",
    title: "LangSmith 测试经验：Agent 追踪与排查实战",
    summary: "从一次追踪出发，检查路由选择、工具调用和接口结果，让 Agent 的故障排查有迹可循。",
    notes: ["先锁定具体请求的 Trace，再观察节点输入、输出与耗时。不要用另一轮执行的结果解释当前故障。", "区分模型没有选择工具、工具调用参数错误和工具服务执行失败，这三类问题需要不同的修复路径。", "把成功与失败样本并排比较，关注最早偏离预期的节点，而不仅是最后一个报错的节点。"],
    checks: ["任务 ID、会话 ID 与 Trace 是否能相互关联？", "敏感输入是否经过脱敏，且追踪失败不会阻塞业务执行？"]
  },
  {
    slug: "langgraph-langchain-learning-notes", category: "AI 开发", date: "2026-05-12", visual: "type", color: "cyan", label: "LEARNING / ORCHESTRATION", word: "BUILD.", subline: "MODEL + TOOLS + STATE",
    title: "LangGraph 与 LangChain 学习笔记",
    summary: "从模型调用、Pydantic 结构化输出到图状态编排，理解一个 Agent 的各层职责如何连接。",
    notes: ["把模型调用能力和流程控制能力分开理解：一次生成负责输出，图编排负责决定何时执行、如何衔接。", "结构化输出既需要模式约束，也需要业务校验。字段类型正确，并不代表内容满足当前任务的实际需求。", "阅读图代码时，先画出节点、边和状态字段，再追踪一条具体输入如何沿路径推进。"],
    checks: ["节点更新是否只修改自己负责的状态字段？", "模型返回不满足约束的内容时，是否有明确的重试或失败策略？"]
  }
];
