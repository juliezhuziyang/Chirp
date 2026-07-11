/**
 * Seed demo user accounts via the deployed Supabase auth/register API.
 * Usage: node scripts/seed-demo-users.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const INFO_FILE = path.join(ROOT, "utils", "supabase", "info.tsx");
const OUT_FILE = path.join(__dirname, "seeded-demo-users.json");

const DEFAULT_PASSWORD = "ChirpDemo2026!";

const USERS = [
  { name: "Emily Chen", email: "emily.chen.birds@gmail.com" },
  { name: "Marcus Williams", email: "marcus.williams.pets@outlook.com" },
  { name: "Sophia Martinez", email: "sophia.martinez.avian@yahoo.com" },
  { name: "Liam O'Connor", email: "liam.oconnor.parrots@gmail.com" },
  { name: "Ava Thompson", email: "ava.thompson.chirp@icloud.com" },
  { name: "Noah Patel", email: "noah.patel.birdcare@gmail.com" },
  { name: "Isabella Rossi", email: "isabella.rossi.lovebird@outlook.com" },
  { name: "Ethan Kim", email: "ethan.kim.feather@yahoo.com" },
  { name: "Mia Johnson", email: "mia.johnson.nest@gmail.com" },
  { name: "Lucas Anderson", email: "lucas.anderson.wings@hotmail.com" },
  { name: "Olivia Brown", email: "olivia.brown.chirps@gmail.com" },
  { name: "Benjamin Lee", email: "benjamin.lee.birdmom@outlook.com" },
  { name: "Charlotte Davis", email: "charlotte.davis.peep@yahoo.com" },
  { name: "Henry Wilson", email: "henry.wilson.avianlife@gmail.com" },
  { name: "Amelia Taylor", email: "amelia.taylor.parrotfan@icloud.com" },
  { name: "James Miller", email: "james.miller.birdwatch@gmail.com" },
  { name: "Harper Garcia", email: "harper.garcia.sunnybird@outlook.com" },
  { name: "Alexander Moore", email: "alex.moore.chirper@yahoo.com" },
  { name: "Evelyn Jackson", email: "evelyn.jackson.nestbox@gmail.com" },
  { name: "Daniel White", email: "daniel.white.feathered@hotmail.com" },
  { name: "Scarlett Harris", email: "scarlett.harris.birdlove@gmail.com" },
  { name: "Michael Clark", email: "michael.clark.tweet@outlook.com" },
  { name: "Grace Lewis", email: "grace.lewis.wingbeat@yahoo.com" },
  { name: "William Walker", email: "william.walker.parakeet@gmail.com" },
  { name: "Chloe Hall", email: "chloe.hall.chirpuser@icloud.com" },
  { name: "David Young", email: "david.young.birdparent@gmail.com" },
  { name: "Zoe Allen", email: "zoe.allen.aviary@outlook.com" },
  { name: "Matthew King", email: "matthew.king.peachface@yahoo.com" },
  { name: "Lily Wright", email: "lily.wright.birdsong@gmail.com" },
  { name: "Joseph Scott", email: "joseph.scott.nestmate@hotmail.com" },
  { name: "王雨桐", email: "yutong.wang.bird@qq.com" },
  { name: "陈思远", email: "siyuan.chen.chirp@163.com" },
  { name: "李欣怡", email: "xinyi.li.lovebird@gmail.com" },
  { name: "张浩然", email: "haoran.zhang.parrot@outlook.com" },
  { name: "刘梓涵", email: "zihan.liu.feather@yahoo.com" },
  { name: "赵一鸣", email: "yiming.zhao.birdcare@gmail.com" },
  { name: "黄诗涵", email: "shihan.huang.chirp@icloud.com" },
  { name: "周子轩", email: "zixuan.zhou.nest@gmail.com" },
  { name: "吴佳琪", email: "jiaqi.wu.peep@hotmail.com" },
  { name: "徐天宇", email: "tianyu.xu.wings@qq.com" },
  { name: "孙梦琪", email: "mengqi.sun.birdmom@163.com" },
  { name: "马俊豪", email: "junhao.ma.chirps@gmail.com" },
  { name: "朱雅婷", email: "yating.zhu.avian@outlook.com" },
  { name: "胡嘉怡", email: "jiayi.hu.lovebird@yahoo.com" },
  { name: "林泽宇", email: "zeyu.lin.birdwatch@gmail.com" },
  { name: "何静怡", email: "jingyi.he.nestbox@icloud.com" },
  { name: "高子墨", email: "zimo.gao.feathered@qq.com" },
  { name: "郑晓雯", email: "xiaowen.zheng.chirpuser@163.com" },
  { name: "梁宇航", email: "yuhang.liang.parakeet@gmail.com" },
  { name: "宋语嫣", email: "yuyan.song.birdlove@outlook.com" },
];

function readAnonKey() {
  const content = fs.readFileSync(INFO_FILE, "utf8");
  const match = content.match(/publicAnonKey = "([^"]+)"/);
  if (!match) throw new Error("Could not parse publicAnonKey");
  return match[1];
}

async function registerUser(baseUrl, anonKey, user) {
  const res = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${anonKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: user.name,
      email: user.email,
      password: DEFAULT_PASSWORD,
    }),
  });
  const text = await res.text();
  let data = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  const anonKey = readAnonKey();
  const baseUrl =
    "https://edjtshisztwaunytdlxd.supabase.co/functions/v1/make-server-b89d4352";

  const results = [];
  for (const user of USERS) {
    const result = await registerUser(baseUrl, anonKey, user);
    const entry = {
      name: user.name,
      email: user.email,
      password: DEFAULT_PASSWORD,
      status: result.ok ? "created" : "failed",
      httpStatus: result.status,
      detail: result.data?.error || result.data?.detail || null,
    };
    results.push(entry);
    const mark = result.ok ? "OK" : "FAIL";
    console.log(`[${mark}] ${user.email}`);
    await new Promise((r) => setTimeout(r, 150));
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    defaultPassword: DEFAULT_PASSWORD,
    total: results.length,
    created: results.filter((r) => r.status === "created").length,
    failed: results.filter((r) => r.status === "failed").length,
    users: results,
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(summary, null, 2));
  console.log(`\nWrote ${OUT_FILE}`);
  console.log(`Created: ${summary.created}, Failed: ${summary.failed}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
