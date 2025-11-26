import Team from "../../database/examples/Teams.js";

let passed = 0;
let failed = 0;

// ---------- Test Helpers ----------
function ok(description) {
  console.log(`[OK]   ${description}`);
  passed++;
}

function fail(description) {
  console.log(`[FAIL] ${description}`);
  failed++;
}

function expect(description, condition) {
  condition ? ok(description) : fail(description);
}

function assertEquals(description, actual, expected) {
  const success = JSON.stringify(actual) === JSON.stringify(expected);

  if (success) {
    ok(description);
  } else {
    fail(description);
    console.log(`  Expected: ${JSON.stringify(expected)}`);
    console.log(`  Actual:   ${JSON.stringify(actual)}`);
  }
}

// ---------- TEST RUNNER ----------
console.log("\n=== TEAM CLASS END-TO-END TESTS ===\n");

function runTeamTests() {


  // Initialization Tests
  console.log("Initialization Tests:\n");

  try {
    const team1 = new Team({
      name: "Alpha",
      organizer: "user1",
      teamRank: 1,
      maxMembers: 5
    });

    expect("Team instance created successfully", !!team1);
    expect("Organizer auto-added as member", team1.members.includes("user1"));
    expect("RankScore defaults to 0", team1.rankScore === 0);
    expect("MaxRankScore defaults to 100", team1.maxRankScore === 100);

    assertEquals("Team name set correctly", team1.name, "Alpha");
    assertEquals("Organizer set correctly", team1.organizer, "user1");
    assertEquals("Max members set correctly", team1.maxMembers, 5);

  } catch (error) {
    fail(`Initialization tests crashed: ${error.message}`);
  }


  // Custom members test
  try {
    const team2 = new Team({
      name: "Beta",
      organizer: "user2",
      members: ["user2", "user3"],
      teamRank: 2,
      maxMembers: 5
    });

    expect("Members passed in constructor are preserved", team2.members.length === 2);

  } catch (error) {
    fail(`Custom members initialization crashed: ${error.message}`);
  }


  // Member Management Tests
  console.log("\nMember Management Tests:\n");

  try {
    const memberTeam = new Team({
      name: "MemberTest",
      organizer: "captain",
      teamRank: 1,
      maxMembers: 5
    });

    expect("Members array exists", Array.isArray(memberTeam.members));
    expect("Organizer included in members", memberTeam.members.includes("captain"));

    // Add member
    try {
      const before = memberTeam.members.length;

      expect("addMember() exists", typeof memberTeam.addMember === "function");

      memberTeam.addMember("user2");

      expect("addMember() increases member count", memberTeam.members.length === before + 1);

    } catch (err) {
      console.log(`[INFO] addMember error: ${err.message}`);
      fail("addMember should not throw");
    }

    // Remove member
    try {
      if (memberTeam.members.includes("user2")) {
        const before = memberTeam.members.length;

        expect("removeMember() exists", typeof memberTeam.removeMember === "function");

        memberTeam.removeMember("user2");

        expect("removeMember() reduces member count", memberTeam.members.length < before);
      }
    } catch (err) {
      console.log(`[INFO] removeMember error: ${err.message}`);
    }

  } catch (error) {
    fail(`Member management tests crashed: ${error.message}`);
  }

  // Rank Progression Tests
  console.log("\nRank Progression Tests:\n");

  try {
    const rankTeam = new Team({
      name: "Rankers",
      organizer: "admin",
      teamRank: 1,
      maxMembers: 10,
      rankScore: 0,
      maxRankScore: 100
    });

    rankTeam.increaseRank(20);
    expect("increaseRank() adds score", rankTeam.rankScore === 20);
    expect("Rank unchanged below threshold", rankTeam.teamRank === 1);

    rankTeam.increaseRank(90);
    expect("Rank rises when score passes maxRankScore", rankTeam.teamRank === 2);
    expect("RankScore resets after level up", rankTeam.rankScore === 10);

  } catch (error) {
    fail(`Rank progression tests crashed: ${error.message}`);
  }


  // Basic Property Access Tests
  console.log("\nBasic Property Access Tests:\n");

  try {
    const basicTeam = new Team({
      name: "Basic",
      organizer: "basicUser",
      teamRank: 1,
      maxMembers: 3
    });

    expect("Name accessible", basicTeam.name === "Basic");
    expect("Organizer accessible", basicTeam.organizer === "basicUser");
    expect("TeamRank accessible", basicTeam.teamRank === 1);
    expect("MaxMembers accessible", basicTeam.maxMembers === 3);
    expect("Members accessible", Array.isArray(basicTeam.members));
    expect("RankScore accessible", typeof basicTeam.rankScore === "number");
    expect("MaxRankScore accessible", typeof basicTeam.maxRankScore === "number");

  } catch (error) {
    fail(`Basic property access tests crashed: ${error.message}`);
  }



  // Edge Case Tests
  console.log("\nEdge Case Tests:\n");

  try {
    const minimalTeam = new Team({
      name: "Minimal",
      organizer: "min",
      teamRank: 1,
      maxMembers: 5
    });

    expect("Minimal team created", minimalTeam.name === "Minimal");

    const zeroTeam = new Team({
      name: "Zero",
      organizer: "zero",
      teamRank: 1,
      maxMembers: 5
    });

    zeroTeam.increaseRank(0);
    expect("Zero increase does nothing", zeroTeam.rankScore === 0);

  } catch (error) {
    fail(`Edge case tests crashed: ${error.message}`);
  }


  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("TEST SUMMARY");
  console.log("=".repeat(50));
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
}

//runTeamTests();
