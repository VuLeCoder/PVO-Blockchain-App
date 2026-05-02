const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment process...");

  // =========================
  // 1. DEPLOY SMART CONTRACT
  // =========================
  const Contract = await hre.ethers.getContractFactory("ImageStorage");
  const contract = await Contract.deploy();

  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("✅ ImageStorage deployed to:", address);

  // =========================
  // 2. SAVE ABI & ADDRESS FOR BACKEND/PYTHON
  // =========================
  const artifact = await hre.artifacts.readArtifact("ImageStorage");
  const backendPath = path.join(__dirname, "../../backend/blockchain");

  // Kiểm tra nếu thư mục đã tồn tại, tiến hành xóa các file cũ
  if (fs.existsSync(backendPath)) {
    const files = fs.readdirSync(backendPath);
    for (const file of files) {
      // Xóa các file .json cũ (abi.json, contract.json)
      if (file.endsWith(".json")) {
        fs.unlinkSync(path.join(backendPath, file));
        console.log(`🗑️  Deleted old file: ${file}`);
      }
    }
  } else {
    // Nếu chưa có thư mục thì tạo mới
    fs.mkdirSync(backendPath, { recursive: true });
  }

  // Ghi file mới
  fs.writeFileSync(
    path.join(backendPath, "abi.json"),
    JSON.stringify(artifact.abi, null, 2),
  );

  fs.writeFileSync(
    path.join(backendPath, "contract.json"),
    JSON.stringify({ address }, null, 2),
  );

  console.log("📦 Fresh ABI and Address exported to backend/");

  // =========================
  // 3. AUTO UPDATE .env AT ROOT
  // =========================
  // Đảm bảo đường dẫn này trỏ đúng ra thư mục pvo_blockchain/
  const envPath = path.join(__dirname, "../../.env");

  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf-8");
  }

  // Sử dụng Regex để cập nhật hoặc thêm mới CONTRACT_ADDRESS một cách sạch sẽ[cite: 3]
  const envVar = "CONTRACT_ADDRESS";
  const envLine = `${envVar}=${address}`;

  if (envContent.includes(envVar)) {
    envContent = envContent.replace(new RegExp(`${envVar}=.*`, "g"), envLine);
  } else {
    envContent += `${envLine}\n`;
  }

  fs.writeFileSync(envPath, envContent.trim() + "\n");
  console.log("📝 Root .env updated with new contract address.");
}

main().catch((err) => {
  console.error("❌ Deployment failed:", err);
  process.exit(1);
});
