export default {
  async fetch(request, env) {
    const id = new URL(request.url).pathname.slice(1);
    let uuid = id.replaceAll("-", "");

    // Not a UUID: resolve the username through Mojang
    if (!/^[0-9a-f]{32}$/i.test(uuid)) {
      if (!/^\w{3,16}$/.test(id)) {
        return Response.json({ error: "Usage: /<username or uuid>" }, { status: 400 });
      }
      const mojang = await fetch(`https://api.mojang.com/users/profiles/minecraft/${id}`);
      if (!mojang.ok) {
        return Response.json({ error: "Unknown player" }, { status: 404 });
      }
      uuid = (await mojang.json()).id;
    }

    const res = await fetch(`https://api.hypixel.net/v2/player?uuid=${uuid}`, {
      headers: { "API-Key": env.HYPIXEL_API_KEY },
    });
    return new Response(res.body, {
      status: res.status,
      headers: { "content-type": "application/json" },
    });
  },
};
