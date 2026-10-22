export default {
  async fetch(request, env) {
    if (!env.HYPIXEL_API_KEY) {
      return Response.json({ error: "HYPIXEL_API_KEY secret is not set" }, { status: 500 });
    }

    const id = new URL(request.url).pathname.slice(1);
    let uuid = id.replaceAll("-", "").toLowerCase();

    try {
      // Not a UUID: resolve the username through Mojang
      if (!/^[0-9a-f]{32}$/.test(uuid)) {
        if (!/^\w{3,16}$/.test(id)) {
          return Response.json({ error: "Usage: /<username or uuid>" }, { status: 400 });
        }
        const mojang = await fetch(`https://api.mojang.com/users/profiles/minecraft/${id}`);
        if (mojang.status === 404 || mojang.status === 204) {
          return Response.json({ error: "Unknown player" }, { status: 404 });
        }
        if (!mojang.ok) {
          return Response.json({ error: `Mojang error ${mojang.status}` }, { status: 502 });
        }
        uuid = (await mojang.json()).id;
      }

      const res = await fetch(`https://api.hypixel.net/v2/skyblock/profiles?uuid=${uuid}`, {
        headers: { "API-Key": env.HYPIXEL_API_KEY },
      });
      const body = await res.json();
      if (!res.ok || !body.success) {
        return Response.json(body, { status: res.ok ? 502 : re
      }

      // Keep only what the app reads, in the same shape as Hypixel's response.
      const profiles = body.profiles?.map((p) => {
        const member = p.members[uuid] ?? {};
        return {
          cute_name: p.cute_name,
          selected: p.selected,
          members: {
            [uuid]: {
              player_data: { experience: member.player_data?.experience ?? {} },
              collection: member.collection,
            },
          },
        };
      }) ?? null;

      return Response.json({ success: true, profiles });
    } catch (e) {
      return Response.json({ error: "Upstream request failed"
    }
  },
};