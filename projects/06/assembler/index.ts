import parser from "./parser";
// import code from './code'
import symbolTable from "./symbolTable";
import * as fs from "fs";

const fileName = process.argv[2];
let newFile = '';

const data = fs.readFileSync(`${fileName}.asm`, "utf-8")
let lines = data.split("\n");

lines = lines.map(line => parser.clear(line)).filter(e=>e);

// 第一轮预处理
// 该阶段主要是在符号表中简历每条命令以及其对应的地址,逐行处理整个汇编程序
// 构建符号表,每一行得用数字记录ROM地址,当命令最终被加载到地址中,这个数字从0开始
// 他就是PC计数器,他遇到注释行代码不自增,或者(XXX)这种 L-COMMAND 不自增,并且在符号表中将他们相关联
for (let pc = 0; pc < lines.length;) {
  const line = lines[pc]
  const type = parser.commandType(line.trim());
  if (type === "L_COMMAND") {
    symbolTable.addEntry(line.replace(/[\(\)]/g, ""), pc);
    lines.splice(pc, 1)
  } else {
    pc++
  }
};


// 第二轮真正处理
// 现在对整个程序进行处理,对每一行进行语法树分析
// 每次遇到符号变化A-指令时候,就对@xxx分析他是不是符号,如果能在符号表中查询到,则替换,
// 如果查询不到,则他就代表变量.为了处理这个变量
lines.forEach((line) => {
  line = parser.advance(line);
  line && (newFile += line + "\r\n");
});
fs.writeFileSync(`${fileName}.hack`, newFile);
