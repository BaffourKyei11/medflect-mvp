import { ethers } from "hardhat";
async function main(){ const F=await ethers.getContractFactory("ConsentAudit"); const c=await F.deploy(); await c.waitForDeployment(); console.log("ConsentAudit deployed:", await c.getAddress()); }
main().catch((e)=>{ console.error(e); process.exit(1); });
