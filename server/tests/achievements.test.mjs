import assert from "node:assert/strict";
import { checkNewAchievements, listForUser, ACHIEVEMENTS } from "../src/services/achievements.js";

const newUser = () => ({
  completedLevels: [], achievements: [], totalStars: 0, totalScore: 0,
  bubblesPopped: 0, bestCombo: 0, boostersUsedTotal: 0, rescuedObjects: 0,
});

assert.ok(ACHIEVEMENTS.length >= 10, "at least 10 achievements");
assert.equal(new Set(ACHIEVEMENTS.map((a) => a.id)).size, ACHIEVEMENTS.length, "ids are unique");

// a brand new player has nothing
let u = newUser();
assert.equal(checkNewAchievements(u).length, 0);

// first pop + 5 levels
u.bubblesPopped = 5;
u.completedLevels = [1, 2, 3, 4, 5].map((levelId) => ({ levelId, stars: 1, bestScore: 100 }));
let got = checkNewAchievements(u).map((a) => a.id).sort();
assert.deepEqual(got, ["bubble_beginner", "first_pop"]);

// the same achievement is never given twice
assert.equal(checkNewAchievements(u).length, 0);
assert.equal(u.achievements.length, 2);

// combo, three stars, perfect aim
u.bestCombo = 10;
u.completedLevels[0].stars = 3;
got = checkNewAchievements(u, { perfectAim: true }).map((a) => a.id).sort();
assert.deepEqual(got, ["combo_master", "combo_starter", "perfect_aim", "three_star_hero"]);

// perfect aim is only for the game that was just verified
const other = newUser();
assert.ok(!checkNewAchievements(other, { perfectAim: false }).some((a) => a.id === "perfect_aim"));

// rescue hero needs 25 chicks
const r = newUser();
r.rescuedObjects = 24;
assert.ok(!checkNewAchievements(r).some((a) => a.id === "rescue_hero"));
r.rescuedObjects = 25;
assert.ok(checkNewAchievements(r).some((a) => a.id === "rescue_hero"));

// the list shows progress
const list = listForUser(newUser());
const hunter = list.find((a) => a.id === "bubble_hunter");
assert.equal(hunter.progress, 0);
assert.equal(hunter.unlocked, false);
const v = newUser(); v.bubblesPopped = 400;
assert.equal(listForUser(v).find((a) => a.id === "bubble_hunter").progress, 400);

console.log("All achievement tests passed");
