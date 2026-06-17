const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const ledgerModel = require(path.resolve(__dirname,'src','models','ledger.model'));

function parseEnv(filePath){
  try{
    const content = fs.readFileSync(filePath,'utf8');
    const lines = content.split(/\r?\n/);
    const env = {};
    lines.forEach(l=>{
      const m = l.match(/^\s*([A-Z_]+)\s*=\s*(.*)\s*$/);
      if(m){
        env[m[1]] = m[2].replace(/^"|"$/g,'');
      }
    });
    return env;
  }catch(e){
    return {};
  }
}

async function run(){
  try{
    const env = parseEnv(path.resolve(__dirname,'.env'));
    const MONGO_URI = env.MONGO_URI || process.env.MONGO_URI;
    if(!MONGO_URI) throw new Error('MONGO_URI not found');
    await mongoose.connect(MONGO_URI);
    const accountId = '6a327f4054cc4aecfedffadd';
    const docs = await ledgerModel.find({ account: mongoose.Types.ObjectId(accountId) }).lean();
    console.log('FOUND', docs.length, 'ledger entries for account', accountId);
    docs.forEach(d=> console.log(JSON.stringify({ _id: d._id, account: d.account, amount: d.amount, type: d.type, transaction: d.transaction }, null, 2)));
    await mongoose.disconnect();
  }catch(err){
    console.error('ERROR', err && err.message ? err.message : err);
    process.exit(1);
  }
}

run();