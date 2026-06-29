import fs from "fs"
import fetch from "node-fetch"
import FormData from "form-data"
import path from "path";

(async () => {
  const curseForgeFileID = await curseforgeUpload();
  const content = `
# ${process.env.PROJECT_NAME} V${process.env.VERSION}
${process.env.CHANGELOG}

### Download Section
- <:linkvertise:1514208079502118942> [Linkvertise](https://linkvertise.com/1073400/FvQG2MBcODtc?o=sharing) (to support me!)
- <:Github:1393587335979073698> [Github](${process.env.GITHUB_RELEASE})
- <:CurseForge:1377993483800940584> [CurseForge](https://www.curseforge.com/minecraft-bedrock/scripts/${process.env.PROJECT_NAME}/files/${curseForgeFileID})

<@${process.env.ROLE}>
-# You may need to wait for CurseForge to upload the file in order for you to download it. Therefore, you can either wait for the file in curseforge or download it directly from Github.`;

  const res = await fetch(process.env.DISCORD_WEBHOOK + `?thread_id=${process.env.THREAD_ID}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      content,
      username: "Changes Logger",
      avatar_url: "https://cdn.discordapp.com/attachments/1388361920696029265/1393812849880469595/Change_Logger.png?ex=687488df&is=6873375f&hm=8e241886a7643c7928c7d02bf93aec07343e233d19f141cb20b5f051fc2285c5&",
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Discord webhook failed: ${text}`);
  }
})();

async function curseforgeUpload() {
  const form = new FormData();
  const filePath = path.resolve(process.env.FILE_NAME);

  form.append("file", fs.createReadStream(filePath));
  form.append("metadata",
    JSON.stringify({
      changelog: process.env.CHANGELOG,
      changelogType: "markdown",
      gameVersion: [],
      releaseType: "release",
    })
  );

  const res = await fetch(`https://minecraft-bedrock.curseforge.com/api/projects/${process.env.CURSEFORGE_PROJECT_ID}/upload-file`,
    {
      method: "POST",
      headers: {
        "X-Api-Token": process.env.CURSEFORGE_TOKEN,
      },
      body: form,
    }
  );

  const text = await res.text();
  return JSON.parse(text).id;
}
