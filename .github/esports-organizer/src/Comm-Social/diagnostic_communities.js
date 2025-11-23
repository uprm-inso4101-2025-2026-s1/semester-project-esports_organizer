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

  test("Constructor validation with missing fields", () => {
    const minimal = new Community({
      name: "Minimal",
      description: "Basic description",
      admin: "admin123",
      id: "MIN1"
    });
    
    check("minimal name", minimal.getName(), "Minimal");
    check("minimal admin", minimal.getAdmin(), "admin123");
    check("minimal members default", minimal.getMembers(), []);
    check("minimal posts default", minimal.getPosts(), []);
    check("minimal tags default", minimal.getTags(), []);
  });

  test("Search by multiple criteria", () => {
    Community.allCommunities = new Map();
    
    const communities = [
      new Community({
        name: "Valorant Pro",
        description: "Competitive Valorant",
        admin: "pro_admin",
        members: ["user1", "user2", "user3"],
        tags: ["valorant", "competitive", "pro"],
        id: "VAL1",
        game: "Valorant",
        location: "NA"
      }),
      new Community({
        name: "Casual Gamers",
        description: "Fun gaming community",
        admin: "casual_admin", 
        members: ["user4", "user5"],
        tags: ["casual", "fun", "variety"],
        id: "CAS1",
        game: "Various",
        location: "EU"
      }),
      new Community({
        name: "Valorant Beginners",
        description: "Learning Valorant",
        admin: "beginner_admin",
        members: ["user6", "user7", "user8", "user9"],
        tags: ["valorant", "beginners", "learning"],
        id: "VAL2", 
        game: "Valorant",
        location: "AS"
      })
    ];

    const valorantCommunities = Array.from(Community.allCommunities.values())
      .filter(c => c.getGame() === "Valorant");
    check("communities by game Valorant", valorantCommunities.length, 2);

    const largeCommunities = Array.from(Community.allCommunities.values())
      .filter(c => c.getMembers().length > 2);
    check("large communities (>2 members)", largeCommunities.length, 2);

    const competitiveTag = Array.from(Community.allCommunities.values())
      .filter(c => c.getTags().includes("competitive"));
    check("communities with competitive tag", competitiveTag.length, 1);
  });

  test("Modification of arrays and nested objects", () => {
    const posts = [
      { id: "P1", name: "First Post", content: "Hello world", author: "user1" },
      { id: "P2", name: "Second Post", content: "Gaming tips", author: "user2" }
    ];

    const c = new Community({
      name: "Nested Test",
      description: "Testing nested objects",
      admin: "admin",
      members: ["user1", "user2"],
      posts: posts,
      tags: ["test"],
      id: "NEST1",
      dateCreated: new Date("2024-01-15"),
      game: "TestGame",
      location: "TestLoc"
    });

    const foundPost = c.findPost("First Post");
    check("found post by name", foundPost?.name, "First Post");
    
    const newPost = {
      id: "P3",
      name: "Third Post", 
      content: "Advanced strategies",
      author: "user3",
      likes: 5,
      comments: ["Good post!", "Thanks for sharing"]
    };
    c.addPost(newPost);
    check("posts count after adding", c.getPosts().length, 3);
    
    const foundNewPost = c.findPost("Third Post");
    check("found new post with extra fields", foundNewPost?.likes, 5);
  });

  test("Date operations", () => {
    const date1 = new Date("2024-01-01");
    const date2 = new Date("2024-02-01");
    const date3 = new Date("2024-03-01");

    const c1 = new Community({
      name: "Old Community",
      description: "Oldest",
      admin: "admin1",
      id: "DATE1",
      dateCreated: date1
    });

    const c2 = new Community({
      name: "Mid Community", 
      description: "Middle",
      admin: "admin2",
      id: "DATE2",
      dateCreated: date2
    });

    const c3 = new Community({
      name: "New Community",
      description: "Newest", 
      admin: "admin3",
      id: "DATE3",
      dateCreated: date3
    });

    check("dateCreated getter c1", c1.getDateCreated().getTime(), date1.getTime());
    check("dateCreated getter c2", c2.getDateCreated().getTime(), date2.getTime());
  });

  test("Error handling and edge cases", () => {
    const c = new Community({
      name: "Error Test",
      description: "Testing error handling",
      admin: "admin",
      members: [],
      posts: [],
      tags: [],
      id: "ERR1",
      game: "TestGame"
    });

    c.removeMember("nonexistent");
    check("members still empty after removing nonexistent", c.getMembers(), []);

    c.setName("");
    check("empty name", c.getName(), "");
    
    c.setDescription(null);
    check("null description", c.getDescription(), null);

    check("find member in empty array", c.findMember("anyone"), null);
    check("find post in empty array", c.findPost("anything"), null);
    check("find tag in empty array", c.findTag("anytag"), null);
  });

  test("Complete serialization and deserialization", () => {
    const originalDate = new Date("2024-06-15T10:30:00Z");
    const complexCommunity = new Community({
      name: "Complex Community",
      description: "A very detailed community with lots of data",
      admin: "super_admin",
      members: ["user1", "user2", "user3", "user4", "user5"],
      posts: [
        {
          id: "POST1",
          name: "Welcome Post", 
          content: "Welcome to our community!",
          author: "super_admin",
          timestamp: originalDate,
          likes: 10,
          comments: ["Great!", "Thanks!", "Awesome community"]
        },
        {
          id: "POST2",
          name: "Rules and Guidelines",
          content: "Please follow these rules...",
          author: "moderator1", 
          timestamp: new Date("2024-06-16T09:00:00Z"),
          likes: 5,
          pinned: true
        }
      ],
      tags: ["gaming", "community", "competitive", "friendly", "active"],
      id: "COMPLEX1",
      dateCreated: originalDate,
      game: "Multi-Game",
      location: "Global",
      icon: "/icons/complex-icon.png",
      banner: "/banners/complex-banner.jpg"
    });

    const firestoreData = complexCommunity.toFirestore();
    
    check("firestore data has name", firestoreData.name, "Complex Community");
    check("firestore data has correct member count", firestoreData.members.length, 5);
    check("firestore data has posts", firestoreData.posts.length, 2);
    check("firestore data has tags", firestoreData.tags.length, 5);

    const reconstructed = Community.fromFirestore(firestoreData);
    
    check("reconstructed name", reconstructed.getName(), "Complex Community");
    check("reconstructed admin", reconstructed.getAdmin(), "super_admin");
    check("reconstructed members count", reconstructed.getMembers().length, 5);
    check("reconstructed posts count", reconstructed.getPosts().length, 2);
    check("reconstructed tags count", reconstructed.getTags().length, 5);
    check("reconstructed game", reconstructed.getGame(), "Multi-Game");
    check("reconstructed location", reconstructed.getLocation(), "Global");
    
    // Verify specific post
    const welcomePost = reconstructed.findPost("Welcome Post");
    check("reconstructed post found", welcomePost !== null, true);
    check("reconstructed post likes", welcomePost?.likes, 10);
  });

  test("Batch operations and performance", () => {
    Community.allCommunities = new Map();
    
    const communities = [];
    const startTime = Date.now();
    
    for (let i = 1; i <= 100; i++) {
      const community = new Community({
        name: `Community ${i}`,
        description: `Description for community number ${i}`,
        admin: `admin${i}`,
        members: [`user${i}`, `user${i + 100}`, `user${i + 200}`],
        posts: [
          { id: `P${i}_1`, name: `Post ${i}-1`, content: `Content ${i}` },
          { id: `P${i}_2`, name: `Post ${i}-2`, content: `More content ${i}` }
        ],
        tags: [`tag${i}`, `category${i % 10}`, "general"],
        id: `BATCH${i}`,
        dateCreated: new Date(2024, 0, i),
        game: `Game${i % 5}`,
        location: `Location${i % 3}`
      });
      communities.push(community);
    }
    
    const createTime = Date.now() - startTime;
    check("created 100 communities", communities.length, 100);
    check("all communities registered", Community.allCommunities.size, 100);
    console.log(`    Creation time for 100 communities: ${createTime}ms`);

    const searchStart = Date.now();
    const game0Communities = Array.from(Community.allCommunities.values())
      .filter(c => c.getGame() === "Game0");
    const searchTime = Date.now() - searchStart;
    
    check("communities with Game0", game0Communities.length, 20);
    console.log(`    Game search time: ${searchTime}ms`);

    const deleteStart = Date.now();
    for (let i = 1; i <= 50; i++) {
      Community.deleteCommunityById(`BATCH${i}`);
    }
    const deleteTime = Date.now() - deleteStart;
    
    check("communities after batch delete", Community.allCommunities.size, 50);
    console.log(`    Deletion time for 50 communities: ${deleteTime}ms`);
  });

  test("Integration and complete workflow", () => {
    Community.allCommunities = new Map();
    
    const admin = "community_creator";
    
    const community = new Community({
      name: "Esports Hub",
      description: "Central hub for esports enthusiasts",
      admin: admin,
      members: [admin],
      posts: [],
      tags: ["esports"],
      id: "ESPORTS_HUB",
      dateCreated: new Date(),
      game: "Multiple",
      location: "Online",
      icon: "/icons/esports.png",
      banner: "/banners/esports.jpg"
    });

    const newMembers = ["player1", "player2", "player3", "player4", "player5"];
    newMembers.forEach(member => community.addMember(member));
    check("community grew to 6 members", community.getMembers().length, 6);

    const posts = [
      { id: "P1", name: "Welcome!", content: "Welcome to Esports Hub", author: admin },
      { id: "P2", name: "Tournament Announcement", content: "Upcoming tournament!", author: "player1" },
      { id: "P3", name: "Strategy Guide", content: "How to improve your gameplay", author: "player2" }
    ];
    posts.forEach(post => community.addPost(post));
    check("community has 3 posts", community.getPosts().length, 3);

    const additionalTags = ["competitive", "tournament", "strategy", "community"];
    additionalTags.forEach(tag => community.addTag(tag));
    check("community has 5 tags", community.getTags().length, 5);

    community.removePost(posts[1]);
    check("post removed", community.getPosts().length, 2);

    community.setDescription("Premier destination for competitive gaming");
    community.setLocation("Global");
    check("description updated", community.getDescription(), "Premier destination for competitive gaming");
    check("location updated", community.getLocation(), "Global");

    // 7. Search and verification
    check("find admin member", community.findMember(admin), admin);
    check("find strategy post", community.findPost("Strategy Guide") !== null, true);
    check("find competitive tag", community.findTag("competitive"), "competitive");

    // 8. Persistence
    const serialized = community.toFirestore();
    const restored = Community.fromFirestore(serialized);
    check("restored community matches original name", restored.getName(), community.getName());
    check("restored community matches original member count", restored.getMembers().length, community.getMembers().length);

    console.log("    Complete community workflow executed successfully");
  });

})();
