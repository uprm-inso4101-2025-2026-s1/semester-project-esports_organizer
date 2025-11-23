// diagnostic_community.js
// Pruebas de la clase Community solo con Node, sin tocar otros archivos.

import Community from "./Community.js";

function title(t) {
  console.log("\n==============================");
  console.log(t);
  console.log("==============================\n");
}

function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? "OK " : "ERR"} | ${name}`);
  if (!ok) {
    console.log("  Expected:", expected);
    console.log("  Got     :", actual);
  }
}

function test(name, fn) {
  console.log("Test:", name);
  try {
    fn();
  } catch (e) {
    console.log("Error:", e);
  }
  console.log("");
}

(function run() {
  // limpiar mapa estático
  Community.allCommunities = new Map();

  title("Pruebas Community");

  test("Crear comunidad básica y registrar en allCommunities", () => {
    const c = new Community({
      name: "Test",
      description: "Desc",
      admin: "admin1",
      members: ["admin1"],
      posts: [],
      tags: ["t1", "t2"],
      id: "C1",
      dateCreated: new Date("2024-01-01"),
      game: "GameX",
      location: "LocX",
      icon: "/icon.png",
      banner: "/banner.png",
    });

    check("allCommunities.get('C1') === c", Community.allCommunities.get("C1") === c, true);
    check("getName()", c.getName(), "Test");
    check("getAdmin()", c.getAdmin(), "admin1");
    check("getTags()", c.getTags(), ["t1", "t2"]);
  });

  test("Setters y getters", () => {
    const c = new Community({
      name: "Old",
      description: "Old desc",
      admin: "adm",
      members: [],
      posts: [],
      tags: [],
      id: "C2",
      dateCreated: new Date("2024-02-01"),
      game: "G1",
      location: "L1",
      icon: "/old-icon.png",
      banner: "/old-banner.png",
    });

    c.setName("New");
    c.setDescription("New desc");
    c.setAdmin("adm2");
    c.setMembers(["m1", "m2"]);
    c.setPosts([{ id: "P1", name: "Post 1" }]);
    c.setTags(["x", "y"]);
    c.setId("C2N");
    c.setGame("G2");
    c.setLocation("L2");
    c.setIcon("/new-icon.png");
    c.setBanner("/new-banner.png");

    check("getName()", c.getName(), "New");
    check("getDescription()", c.getDescription(), "New desc");
    check("getAdmin()", c.getAdmin(), "adm2");
    check("getMembers()", c.getMembers(), ["m1", "m2"]);
    check("getPosts()", c.getPosts(), [{ id: "P1", name: "Post 1" }]);
    check("getTags()", c.getTags(), ["x", "y"]);
    check("getId()", c.getId(), "C2N");
    check("getGame()", c.getGame(), "G2");
    check("getLocation()", c.getLocation(), "L2");
    check("getIcon()", c.getIcon(), "/new-icon.png");
    check("getBanner()", c.getBanner(), "/new-banner.png");
  });

  test("addMember / addPost / addTag + búsquedas", () => {
    const p1 = { id: "P1", name: "Post 1" };
    const p2 = { id: "P2", name: "Post 2" };

    const c = new Community({
      name: "Comm",
      description: "",
      admin: "adm",
      members: ["u1"],
      posts: [p1],
      tags: ["tag1"],
      id: "C3",
      dateCreated: new Date(),
      game: "",
      location: "",
      icon: "",
      banner: "",
    });

    c.addMember("u2");
    c.addPost(p2);
    c.addTag("tag2");

    check("getMembers()", c.getMembers(), ["u1", "u2"]);
    check("getPosts()", c.getPosts(), [p1, p2]);
    check("getTags()", c.getTags(), ["tag1", "tag2"]);

    check("findMember('u2')", c.findMember("u2"), "u2");
    check("findMember('no')", c.findMember("no"), null);

    check("findPost('Post 1')", c.findPost("Post 1"), p1);
    check("findPost('missing')", c.findPost("missing"), null);

    check("findTag('tag2')", c.findTag("tag2"), "tag2");
    check("findTag('zzz')", c.findTag("zzz"), null);
  });

  test("removeMember / removePost / removeTag", () => {
    const p1 = { id: "P1", name: "Post 1" };
    const p2 = { id: "P2", name: "Post 2" };

    const c = new Community({
      name: "Comm",
      description: "",
      admin: "adm",
      members: ["u1", "u2"],
      posts: [p1, p2],
      tags: ["tag1", "tag2"],
      id: "C4",
      dateCreated: new Date(),
      game: "",
      location: "",
      icon: "",
      banner: "",
    });

    c.removeMember("u1");
    c.removeMember("no-existe"); // no rompe
    check("members tras remove", c.getMembers(), ["u2"]);

    c.removePost(p1);
    check("posts tras removePost(p1)", c.getPosts(), [p2]);

    try {
      c.removePost(p1);
      console.log("ERR | removePost de post inexistente no lanzó error");
    } catch (e) {
      console.log("OK  | removePost lanza error cuando no encuentra el post");
    }

    c.removeTag("tag1");
    check("tags tras removeTag('tag1')", c.getTags(), ["tag2"]);

    try {
      c.removeTag("tag1");
      console.log("ERR | removeTag de tag inexistente no lanzó error");
    } catch (e) {
      console.log("OK  | removeTag lanza error cuando no encuentra el tag");
    }
  });

  test("estáticos getCommunityById / deleteCommunityById / findByAdmin", () => {
    Community.allCommunities = new Map();

    const c1 = new Community({
      name: "A",
      description: "",
      admin: "admX",
      members: [],
      posts: [],
      tags: [],
      id: "ID1",
      dateCreated: new Date(),
      game: "",
      location: "",
      icon: "",
      banner: "",
    });

    const c2 = new Community({
      name: "B",
      description: "",
      admin: "admX",
      members: [],
      posts: [],
      tags: [],
      id: "ID2",
      dateCreated: new Date(),
      game: "",
      location: "",
      icon: "",
      banner: "",
    });

    const c3 = new Community({
      name: "C",
      description: "",
      admin: "admY",
      members: [],
      posts: [],
      tags: [],
      id: "ID3",
      dateCreated: new Date(),
      game: "",
      location: "",
      icon: "",
      banner: "",
    });

    check("getCommunityById('ID1') === c1", Community.getCommunityById("ID1") === c1, true);
    check("deleteCommunityById('ID1')", Community.deleteCommunityById("ID1"), true);
    check("getCommunityById('ID1') undefined", Community.getCommunityById("ID1"), undefined);
    check("deleteCommunityById('ID1') again", Community.deleteCommunityById("ID1"), false);

    const byAdmX = Community.findByAdmin("admX");
    check("findByAdmin('admX').length", byAdmX.length, 1);
    check("findByAdmin('admY').length", Community.findByAdmin("admY").length, 1);
  });

  test("toFirestore / fromFirestore", () => {
    const c = new Community({
      name: "FS",
      description: "Desc FS",
      admin: "admFS",
      members: ["m1"],
      posts: [{ id: "PFS", name: "Post FS" }],
      tags: ["fs"],
      id: "FS1",
      dateCreated: new Date("2024-03-01"),
      game: "GameFS",
      location: "LocFS",
      icon: "/fs-icon.png",
      banner: "/fs-banner.png",
    });

    const data = c.toFirestore();
    const rebuilt = Community.fromFirestore(data);

    check("rebuilt instanceof Community", rebuilt instanceof Community, true);
    check("rebuilt id", rebuilt.getId(), "FS1");
    check("rebuilt name", rebuilt.getName(), "FS");
  });

  console.log("\nFin de pruebas de Community.\n");
})();
