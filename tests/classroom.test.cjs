const test=require('node:test'),assert=require('node:assert/strict');
const {runClassroom}=require('./helpers/classroom.cjs');
test('60 clientes simulados enviam uma resposta cada e liberam todas as escutas ao fechar',async()=>{
 const result=await runClassroom(60);assert.equal(result.answerWrites,60);assert.equal(result.memberReads,60);assert.equal(result.totalWrites,120);assert.equal(result.activeListenersAfterClose,0);
});
