App = window.App || {}, App.FilterView = Backbone.View.extend({
filters: {},
events: {
"click a[data-filter-friends]": "filterFriends",
"click .refresh-button": "refreshGames"
},
refreshGames: function(e) {
App.gameList.updateGames(App.gameListView.page), e.preventDefault();
},
filterFriends: function(e) {
var t = this.$(e.currentTarget).closest("li").hasClass("active");
if (this.$(".game-filter").removeClass("active"), t) this.addFilter($(e.currentTarget).data("filter-friends"), !1); else switch (this.$(e.currentTarget).closest("li").addClass("active"), 
$(e.currentTarget).data("filter-friends")) {
case "friends":
this.addFilter("friends", !0), this.addFilter("group", !1);
break;

case "group":
this.addFilter("group", App.current_user.get("group") ? App.current_user.get("group").id : -1), 
this.addFilter("friends", !1);
}
e.preventDefault();
},
addFilter: function(e, t) {
t ? this.filters[e] = t : delete this.filters[e], App.gameList.set("filters", _.extend({}, this.filters)), 
this.$(".fa-filter").css("color", this.filters.timer || this.filters.level ? "#ECB100" : "");
},
render: function() {
return _.each([ {
name: "timer",
values: [ -1, 45, 20, 8 ],
labels: [ "All", "Slow", "Medium", "Fast" ]
}, {
name: "level",
values: _.range(1, 51)
} ], function(i) {
this.$(".slider-" + i.name + " .ui-slider").rtl_slider({
rtl: "ar" === G.lang(),
animate: !0,
max: 10 * (i.values.length - 1),
step: 10,
slide: function(e, t) {
var a, n = Math.abs(parseInt(t.value / 10, 10));
a = i.labels ? G._(i.labels[n]) : 0 === n ? G._("All") : i.values[n], $(".slider-" + i.name + " span").html(a);
},
change: _.bind(function(e, t) {
var a = Math.abs(parseInt(t.value / 10, 10));
this.addFilter(i.name, 0 < a && i.values[a]);
}, this)
}), $(".slider-" + i.name + " span").html(G._("All"));
}, this), this;
}
}), App.GameList = Backbone.Model.extend({
getGamesStartTime: null,
defaults: function() {
return {
game_module: "",
gs_list: [],
filters: {},
loading: !0,
gamesCount: {}
};
},
initialize: function() {
App.comm.registerCallback("updateGameList", _.bind(function(e, t) {
this.getGamesStartTime && (App.statsCollector.average("gameIndexLoadTime", new Date().getTime() - this.getGamesStartTime), 
this.getGamesStartTime = null), this.get("gamesCount")[this.get("game_module")] = _.isNumber(t) && 0 <= t ? t : 0, 
this.set({
gs_list: e,
loading: !1
});
}, this)), App.coplayers.bind("coplayers_set", function() {
this.trigger("change");
}, this), this.bind("change:filters", function() {
this.updateGames();
}, this);
},
throttledUpdateGames_: _.throttle(function(e) {
App.comm.enqueue("engine", "public_games", [ 0, this.get("game_module"), {
filters: this.get("filters"),
page_num: e
} ]), this.getGamesStartTime = new Date().getTime();
}, 2e3),
updateGames: function(e) {
this.throttledUpdateGames_(e), this.set({
gs_list: [],
loading: !0
});
},
numGames: function(e) {
return this.get("gamesCount")[e || this.get("game_module")] || 0;
},
hasVariableNumSeats: function(e) {
e = App.toCamel(e);
var t = Consts.gm_options[e] || {};
return t.seats_per_game && 1 < t.seats_per_game.length;
},
hasVariableFinalScore: function(e) {
return Consts.gm_options[e] && Consts.gm_options[e].final_score;
},
loadGame: function(e) {
$(".page-wrapper").replaceWith(JST["jsts/games/game_show_container"]({
game: App.game
})), App.game.gid = parseInt(e, 10), App.game.load(), App.symposium && App.symposium.setup(), 
App.Shylock && App.Shylock.setup(), App.gameFooter && App.gameFooter.setup(), App.GameMessage && App.GameMessage.setup(), 
App.GameSummary && App.GameSummary.setup(), App.game.bind("ready", function() {
setTimeout(App.attachDefaultTriggers, 250);
}), App.readCookie("show_friends_guider") && App.game.bind("started", App.friendsGuider), 
App.symposium.showChat();
}
}), App.GameListView = Backbone.View.extend({
pageSize: 11,
page: 0,
events: {
"click [data-action]": "runAction"
},
runAction: function(e) {
e.preventDefault(), this[$(e.currentTarget).data("action")](e);
},
initialize: function() {
this.model.observe("change", this.render, this), this.model.observe("change:game_module", function() {
this.model.updateGames(), this.page = 0;
}, this), $('a[data-router="games"]').live("click", _.bind(this.navigateToGame, this)), 
App.comm.registerCallback("redirectToGame", function(e) {
if (App.game.gid && App.game.gid === e) App.game.reload(); else {
App.Lightbox.deactivate("newGame");
var t = "/" + G.lang() + "/games/" + e;
App.gamesRouter.navigate(t, {
trigger: !0
});
}
});
},
clickAd: function(e) {
e.preventDefault();
var t = $(e.currentTarget).attr("href");
window.open(t);
},
navigateToGame: function(e) {
if (e.preventDefault(), !(1 < e.which || e.metaKey || e.ctrlKey)) {
var t = $(e.currentTarget).attr("href");
Backbone.history.hasRoute(t) && App.gamesRouter.navigate(t, {
trigger: !0
});
}
},
renderGamesDropdown: function() {
var e = {
key: "games",
game_module: this.model.get("game_module"),
info: _.bind(function(e) {
return G.pluralize(this.model.numGames(e.underscore()), "game");
}, this),
gameModules: _.map(App.GameList.gameModules, function(e) {
return e.replace(/ /g, "");
})
};
$("#game-title").html(JST["jsts/templates/gm_dropdown"](e));
},
doPaginate: function(e) {
e.preventDefault();
var t = parseInt($(e.target).data("page"), 10);
_.include(_.range(Math.ceil(this.model.numGames() / this.pageSize)), t) && t !== this.page && (this.page = t, 
this.model.updateGames(this.page), $("html, body").animate({
scrollTop: $(".page-header").offset().top
}, 200));
},
games: function() {
return this.model.get("gs_list");
},
lazyGroupAvatar: function() {
_.each(this.$(".group-avatar"), function(e) {
var t = $(e).data("group-id"), a = new Image();
a.onload = function() {
$(e).replaceWith(a);
}, a.src = App.clubImage(t);
});
},
render: function() {
if (this.$el.html(JST["jsts/games/game_list"]({
games: this.games()
})), _.isEmpty(this.games()) && this.model.get("loading")) this.$el.addClass("loading"); else if (this.$el.removeClass("loading"), 
window.googletag && googletag.pubadsReady) {
googletag.cmd.push(function() {
googletag.display("game-rooms-ad");
});
for (var e = 0; e < pageAds.length; e++) googletag.pubads().refresh([ pageAds[e] ]);
}
return this.model.numGames() > this.pageSize ? (this.$el.next(".pagination").html(JST["jsts/templates/pagination"]({
currPage: this.page,
numPages: Math.ceil(this.model.numGames() / this.pageSize)
})), this.$el.next(".pagination").unbind().click(_.bind(this.doPaginate, this))) : this.$el.next(".pagination").html(""), 
this.lazyGroupAvatar(), this.renderGamesDropdown(), App.attachDefaultTriggers(), 
App.playNowView.render(), this;
}
}), App.GamesRouter = Backbone.Router.extend({
routes: {
":l/games/:gm": "switchGameModule"
},
switchGameModule: function(e, t) {
if (t.match(/^\d+($|\?)/) ? ($("ul.game-rooms").addClass("loading").html(""), App.gameList.loadGame(t), 
$("body").removeClass("index").addClass("show")) : (App.game.gid && (App.game.die(), 
App.symposium.get("rooms").remove("g_" + App.game.gid), App.game.gid = null, App.current_user.set("index", null)), 
App.Lightbox.closeAll(), $(".page-wrapper").replaceWith(JST["jsts/games/game_index_container"]({
newGM: t
})), $("body").removeClass("show").addClass("index"), App.gameListView.setElement($("ul.game-rooms")).render(), 
App.filterView.setElement($(".game-filters")).render(), App.leaderboardView.setElement($(".module.weekly-leaderboard")).render(), 
App.playNowView.setElement($(".game-random")), App.leaderboardView.setElement($(".module.weekly-leaderboard")).render(), 
App.symposium && App.symposium.setup(), App.Shylock && App.Shylock.setup(), App.gameFooter && App.gameFooter.setup(), 
App.GameMessage && App.GameMessage.setup(), App.GameSummary && App.GameSummary.setup(), 
App.MiniProfile && App.MiniProfile.setup(), App.game.bind("ready", function() {
setTimeout(App.attachDefaultTriggers, 250);
}), App.gameList.set("game_module", t.split("?")[0]), App.gameList.updateGames(), 
document.title = G._(App.gameList.get("game_module") + ".games.index.title")), "undefined" != typeof ga && ga("send", "pageview", "/" + G.lang() + "/games/" + t), 
window.googletag && googletag.pubadsReady) for (var a = 0; a < pageAds.length; a++) googletag.pubads().refresh([ pageAds[a] ]);
}
}), App.gamesRouter = new App.GamesRouter(), App.LeaderboardView = Backbone.View.extend({
data: {},
page: "current_week",
events: {
"click .moreLink": "fullLB",
"click .tab-nav a": "setTab"
},
fetch: function() {
App.comm.enqueue("karim", "leaderboard", [ App.toCamel(App.gameList.get("game_module")), "game" ]);
},
initialize: function() {
App.comm.registerCallback("game_leaderboard", _.bind(function(e) {
e.game_module.underscore() === App.gameList.get("game_module") && (this.data = e, 
this.render());
}, this)), this.model.observe("change:game_module", function() {
this.render(), this.fetch();
}, this), this.fetch(), 6 < (this.endDate() - App.jawakerDate()) / 1e3 / 3600 / 24 && (this.page = "last_week");
},
setTab: function(e) {
this.page = $(e.currentTarget).data("page"), this.render();
},
fullLB: function(e) {
e.preventDefault(), App.Lightbox.activate({
optional: !0,
backdrop: !0,
template: JST["jsts/games/full_leaderboard"],
users: this.getList(!0),
page: this.page,
title: G._(_.string.trim(App.gameList.get("game_module").replace(/(_|^)[a-z]/g, function(e) {
return " " + e.replace(/_/, "").toUpperCase();
}))),
footer: [ {
type: "a",
name: "Close",
action: "cancel"
} ]
});
},
getList: function(e) {
var t = this.data[this.page] || [], a = e ? 20 : "current_week" === this.page ? 5 : 6;
return t.slice(0, a);
},
render: function() {
return this.$el.html(JST["jsts/games/leaderboard_items"]({
users: this.getList(),
view: this
})), this.$("abbr.timeago").timeago(), this;
},
endDate: function() {
var e = App.jawakerDate();
return new Date(e.getFullYear(), e.getMonth(), e.getDate() - e.getDay() + 7, 3);
}
}), 
// │ Copyright © 2008-2012 Dmitry Baranovskiy (http://raphaeljs.com)    │ \\
// │ Copyright © 2008-2012 Sencha Labs (http://sencha.com)              │ \\
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://dmitry.baranovskiy.com/)          │ \\
function(e) {
var h, m, t = "0.3.4", u = "hasOwnProperty", g = /[\.\/]/, f = "*", s = function() {}, _ = function(e, t) {
return e - t;
}, A = {
n: {}
}, v = function(e, t) {
var a, n = m, i = Array.prototype.slice.call(arguments, 2), r = v.listeners(e), s = 0, o = [], p = {}, c = [], d = h;
h = e;
for (var l = m = 0, u = r.length; l < u; l++) "zIndex" in r[l] && (o.push(r[l].zIndex), 
r[l].zIndex < 0 && (p[r[l].zIndex] = r[l]));
for (o.sort(_); o[s] < 0; ) if (a = p[o[s++]], c.push(a.apply(t, i)), m) return m = n, 
c;
for (l = 0; l < u; l++) if ("zIndex" in (a = r[l])) if (a.zIndex == o[s]) {
if (c.push(a.apply(t, i)), m) break;
do {
if ((a = p[o[++s]]) && c.push(a.apply(t, i)), m) break;
} while (a);
} else p[a.zIndex] = a; else if (c.push(a.apply(t, i)), m) break;
return m = n, h = d, c.length ? c : null;
};
v.listeners = function(e) {
var t, a, n, i, r, s, o, p, c = e.split(g), d = A, l = [ d ], u = [];
for (i = 0, r = c.length; i < r; i++) {
for (p = [], s = 0, o = l.length; s < o; s++) for (a = [ (d = l[s].n)[c[i]], d[f] ], 
n = 2; n--; ) (t = a[n]) && (p.push(t), u = u.concat(t.f || []));
l = p;
}
return u;
}, v.on = function(e, t) {
for (var a = e.split(g), n = A, i = 0, r = a.length; i < r; i++) !(n = n.n)[a[i]] && (n[a[i]] = {
n: {}
}), n = n[a[i]];
for (n.f = n.f || [], i = 0, r = n.f.length; i < r; i++) if (n.f[i] == t) return s;
return n.f.push(t), function(e) {
+e == +e && (t.zIndex = +e);
};
}, v.stop = function() {
m = 1;
}, v.nt = function(e) {
return e ? new RegExp("(?:\\.|\\/|^)" + e + "(?:\\.|\\/|$)").test(h) : h;
}, v.off = v.unbind = function(e, t) {
var a, n, i, r, s, o, p, c = e.split(g), d = [ A ];
for (r = 0, s = c.length; r < s; r++) for (o = 0; o < d.length; o += i.length - 2) {
if (i = [ o, 1 ], a = d[o].n, c[r] != f) a[c[r]] && i.push(a[c[r]]); else for (n in a) a[u](n) && i.push(a[n]);
d.splice.apply(d, i);
}
for (r = 0, s = d.length; r < s; r++) for (a = d[r]; a.n; ) {
if (t) {
if (a.f) {
for (o = 0, p = a.f.length; o < p; o++) if (a.f[o] == t) {
a.f.splice(o, 1);
break;
}
!a.f.length && delete a.f;
}
for (n in a.n) if (a.n[u](n) && a.n[n].f) {
var l = a.n[n].f;
for (o = 0, p = l.length; o < p; o++) if (l[o] == t) {
l.splice(o, 1);
break;
}
!l.length && delete a.n[n].f;
}
} else for (n in delete a.f, a.n) a.n[u](n) && a.n[n].f && delete a.n[n].f;
a = a.n;
}
}, v.once = function(t, a) {
var n = function() {
var e = a.apply(this, arguments);
return v.unbind(t, n), e;
};
return v.on(t, n);
}, v.version = t, v.toString = function() {
return "You are running Eve " + t;
}, "undefined" != typeof module && module.exports ? module.exports = v : "undefined" != typeof define ? define("eve", [], function() {
return v;
}) : e.eve = v;
}(this), 
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
// │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
function() {
function L(e) {
if (L.is(e, "function")) return n ? e() : eve.on("DOMload", e);
if (L.is(e, y)) return L._engine.create[f](L, e.splice(0, 3 + L.is(e[0], O))).add(e);
var t = Array.prototype.slice.call(arguments, 0);
if (L.is(t[t.length - 1], "function")) {
var a = t.pop();
return n ? a.call(L._engine.create[f](L, t)) : eve.on("DOMload", function() {
a.call(L._engine.create[f](L, t));
});
}
return L._engine.create[f](L, arguments);
}
function p(e, t) {
for (var a = 0, n = e.length; a < n; a++) if (e[a] === t) return e.push(e.splice(a, 1)[0]);
}
function z(i, r, s) {
function o() {
var e = Array.prototype.slice.call(arguments, 0), t = e.join("\u2400"), a = o.cache = o.cache || {}, n = o.count = o.count || [];
return a[E](t) ? p(n, t) : (1e3 <= n.length && delete a[n.shift()], n.push(t), a[t] = i[f](r, e)), 
s ? s(a[t]) : a[t];
}
return o;
}
function c() {
return this.hex;
}
function _(e, t) {
for (var a = [], n = 0, i = e.length; n < i - 2 * !t; n += 2) {
var r = [ {
x: +e[n - 2],
y: +e[n - 1]
}, {
x: +e[n],
y: +e[n + 1]
}, {
x: +e[n + 2],
y: +e[n + 3]
}, {
x: +e[n + 4],
y: +e[n + 5]
} ];
t ? n ? i - 4 == n ? r[3] = {
x: +e[0],
y: +e[1]
} : i - 2 == n && (r[2] = {
x: +e[0],
y: +e[1]
}, r[3] = {
x: +e[2],
y: +e[3]
}) : r[0] = {
x: +e[i - 2],
y: +e[i - 1]
} : i - 4 == n ? r[3] = r[2] : n || (r[0] = {
x: +e[n],
y: +e[n + 1]
}), a.push([ "C", (-r[0].x + 6 * r[1].x + r[2].x) / 6, (-r[0].y + 6 * r[1].y + r[2].y) / 6, (r[1].x + 6 * r[2].x - r[3].x) / 6, (r[1].y + 6 * r[2].y - r[3].y) / 6, r[2].x, r[2].y ]);
}
return a;
}
function M(e, t, a, n, i, r) {
null != e ? (this.a = +e, this.b = +t, this.c = +a, this.d = +n, this.e = +i, this.f = +r) : (this.a = 1, 
this.b = 0, this.c = 0, this.d = 1, this.e = 0, this.f = 0);
}
function a() {
return this.x + w + this.y + w + this.width + " \xd7 " + this.height;
}
function D(e, t, a, n, i, r) {
function p(e) {
return ((l * e + d) * e + c) * e;
}
function s(e, t) {
var a = o(e, t);
return ((m * a + h) * a + u) * a;
}
function o(e, t) {
var a, n, i, r, s, o;
for (i = e, o = 0; o < 8; o++) {
if (r = p(i) - e, J(r) < t) return i;
if (J(s = (3 * l * i + 2 * d) * i + c) < 1e-6) break;
i -= r / s;
}
if ((i = e) < (a = 0)) return a;
if ((n = 1) < i) return n;
for (;a < n; ) {
if (r = p(i), J(r - e) < t) return i;
r < e ? a = i : n = i, i = (n - a) / 2 + a;
}
return i;
}
var c = 3 * t, d = 3 * (n - t) - c, l = 1 - c - d, u = 3 * a, h = 3 * (i - a) - u, m = 1 - u - h;
return s(e, 1 / (200 * r));
}
function d(e, t) {
var a = [], n = {};
if (this.ms = t, this.times = 1, e) {
for (var i in e) e[E](i) && (n[R(i)] = e[i], a.push(R(i)));
a.sort(te);
}
this.anim = n, this.top = a[a.length - 1], this.percents = a;
}
function k(e, t, a, n, i, r) {
a = R(a);
var s, o, p, c, d, l, u = e.ms, h = {}, m = {}, g = {};
if (n) for (_ = 0, A = Qe.length; _ < A; _++) {
var f = Qe[_];
if (f.el.id == t.id && f.anim == e) {
f.percent != a ? (Qe.splice(_, 1), p = 1) : o = f, t.attr(f.totalOrigin);
break;
}
} else n = +m;
for (var _ = 0, A = e.percents.length; _ < A; _++) {
if (e.percents[_] == a || e.percents[_] > n * e.top) {
a = e.percents[_], d = e.percents[_ - 1] || 0, u = u / e.top * (a - d), c = e.percents[_ + 1], 
s = e.anim[a];
break;
}
n && t.attr(e.anim[e.percents[_]]);
}
if (s) {
if (o) o.initstatus = n, o.start = new Date() - o.ms * n; else {
for (var v in s) if (s[E](v) && (Y[E](v) || t.paper.customAttributes[E](v))) switch (h[v] = t.attr(v), 
null == h[v] && (h[v] = K[v]), m[v] = s[v], Y[v]) {
case O:
g[v] = (m[v] - h[v]) / u;
break;

case "colour":
h[v] = L.getRGB(h[v]);
var b = L.getRGB(m[v]);
g[v] = {
r: (b.r - h[v].r) / u,
g: (b.g - h[v].g) / u,
b: (b.b - h[v].b) / u
};
break;

case "path":
var y = Se(h[v], m[v]), k = y[1];
for (h[v] = y[0], g[v] = [], _ = 0, A = h[v].length; _ < A; _++) {
g[v][_] = [ 0 ];
for (var x = 1, w = h[v][_].length; x < w; x++) g[v][_][x] = (k[_][x] - h[v][_][x]) / u;
}
break;

case "transform":
var C = t._, G = Ie(C[v], m[v]);
if (G) for (h[v] = G.from, m[v] = G.to, g[v] = [], g[v].real = !0, _ = 0, A = h[v].length; _ < A; _++) for (g[v][_] = [ h[v][_][0] ], 
x = 1, w = h[v][_].length; x < w; x++) g[v][_][x] = (m[v][_][x] - h[v][_][x]) / u; else {
var S = t.matrix || new M(), T = {
_: {
transform: C.transform
},
getBBox: function() {
return t.getBBox(1);
}
};
h[v] = [ S.a, S.b, S.c, S.d, S.e, S.f ], Be(T, m[v]), m[v] = T._.transform, g[v] = [ (T.matrix.a - S.a) / u, (T.matrix.b - S.b) / u, (T.matrix.c - S.c) / u, (T.matrix.d - S.d) / u, (T.matrix.e - S.e) / u, (T.matrix.e - S.f) / u ];
}
break;

case "csv":
var B = H(s[v])[F](V), $ = H(h[v])[F](V);
if ("clip-rect" == v) for (h[v] = $, g[v] = [], _ = $.length; _--; ) g[v][_] = (B[_] - h[v][_]) / u;
m[v] = B;
break;

default:
for (B = [][W](s[v]), $ = [][W](h[v]), g[v] = [], _ = t.paper.customAttributes[v].length; _--; ) g[v][_] = ((B[_] || 0) - ($[_] || 0)) / u;
}
var I = s.easing, N = L.easing_formulas[I];
if (!N) if ((N = H(I).match(j)) && 5 == N.length) {
var P = N;
N = function(e) {
return D(e, +P[1], +P[2], +P[3], +P[4], u);
};
} else N = ne;
if (f = {
anim: e,
percent: a,
timestamp: l = s.start || e.start || +new Date(),
start: l + (e.del || 0),
status: 0,
initstatus: n || 0,
stop: !1,
ms: u,
easing: N,
from: h,
diff: g,
to: m,
el: t,
callback: s.callback,
prev: d,
next: c,
repeat: r || e.times,
origin: t.attr(),
totalOrigin: i
}, Qe.push(f), n && !o && !p && (f.stop = !0, f.start = new Date() - u * n, 1 == Qe.length)) return et();
p && (f.start = new Date() - f.ms * n), 1 == Qe.length && Ze(et);
}
eve("anim.start." + t.id, t, e);
}
}
L.version = "2.0.2", L.eve = eve;
var n, e, V = /[, ]+/, r = {
circle: 1,
rect: 1,
path: 1,
ellipse: 1,
text: 1,
image: 1
}, i = /\{(\d+)\}/g, E = "hasOwnProperty", m = {
doc: document,
win: window
}, t = {
was: Object.prototype[E].call(m.win, "Raphael"),
is: m.win.Raphael
}, s = function() {
this.ca = this.customAttributes = {};
}, f = "apply", W = "concat", g = "createTouch" in m.doc, x = "", w = " ", H = String, F = "split", o = "click dblclick mousedown mousemove mouseout mouseover mouseup touchstart touchmove touchend touchcancel"[F](w), u = {
mousedown: "touchstart",
mousemove: "touchmove",
mouseup: "touchend"
}, A = H.prototype.toLowerCase, q = Math, v = q.max, b = q.min, J = q.abs, C = q.pow, U = q.PI, O = "number", l = "string", y = "array", h = Object.prototype.toString, G = (L._ISURL = /^url\(['"]?([^\)]+?)['"]?\)$/i, 
/^\s*((#[a-f\d]{6})|(#[a-f\d]{3})|rgba?\(\s*([\d\.]+%?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+%?(?:\s*,\s*[\d\.]+%?)?)\s*\)|hsba?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\)|hsla?\(\s*([\d\.]+(?:deg|\xb0|%)?\s*,\s*[\d\.]+%?\s*,\s*[\d\.]+(?:%?\s*,\s*[\d\.]+)?)%?\s*\))\s*$/i), S = {
NaN: 1,
Infinity: 1,
"-Infinity": 1
}, j = /^(?:cubic-)?bezier\(([^,]+),([^,]+),([^,]+),([^\)]+)\)/, T = q.round, R = parseFloat, B = parseInt, $ = H.prototype.toUpperCase, K = L._availableAttrs = {
"arrow-end": "none",
"arrow-start": "none",
blur: 0,
"clip-rect": "0 0 1e9 1e9",
cursor: "default",
cx: 0,
cy: 0,
fill: "#fff",
"fill-opacity": 1,
font: '10px "Arial"',
"font-family": '"Arial"',
"font-size": "10",
"font-style": "normal",
"font-weight": 400,
gradient: 0,
height: 0,
href: "http://raphaeljs.com/",
"letter-spacing": 0,
opacity: 1,
path: "M0,0",
r: 0,
rx: 0,
ry: 0,
src: "",
stroke: "#000",
"stroke-dasharray": "",
"stroke-linecap": "butt",
"stroke-linejoin": "butt",
"stroke-miterlimit": 0,
"stroke-opacity": 1,
"stroke-width": 1,
target: "_blank",
"text-anchor": "middle",
title: "Raphael",
transform: "",
width: 0,
x: 0,
y: 0
}, Y = L._availableAnimAttrs = {
blur: O,
"clip-rect": "csv",
cx: O,
cy: O,
fill: "colour",
"fill-opacity": O,
"font-size": O,
height: O,
opacity: O,
path: "path",
r: O,
rx: O,
ry: O,
stroke: "colour",
"stroke-opacity": O,
"stroke-width": O,
transform: "transform",
width: O,
x: O,
y: O
}, I = /[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/, N = {
hs: 1,
rg: 1
}, P = /,?([achlmqrstvxz]),?/gi, X = /([achlmrqstvz])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/gi, Q = /([rstm])[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029,]*((-?\d*\.?\d*(?:e[\-+]?\d+)?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*)+)/gi, Z = /(-?\d*\.?\d*(?:e[\-+]?\d+)?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,?[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*/gi, ee = (L._radial_gradient = /^r(?:\(([^,]+?)[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*,[\x09\x0a\x0b\x0c\x0d\x20\xa0\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000\u2028\u2029]*([^\)]+?)\))?/, 
{}), te = function(e, t) {
return R(e) - R(t);
}, ae = function() {}, ne = function(e) {
return e;
}, ie = L._rectPath = function(e, t, a, n, i) {
return i ? [ [ "M", e + i, t ], [ "l", a - 2 * i, 0 ], [ "a", i, i, 0, 0, 1, i, i ], [ "l", 0, n - 2 * i ], [ "a", i, i, 0, 0, 1, -i, i ], [ "l", 2 * i - a, 0 ], [ "a", i, i, 0, 0, 1, -i, -i ], [ "l", 0, 2 * i - n ], [ "a", i, i, 0, 0, 1, i, -i ], [ "z" ] ] : [ [ "M", e, t ], [ "l", a, 0 ], [ "l", 0, n ], [ "l", -a, 0 ], [ "z" ] ];
}, re = function(e, t, a, n) {
return null == n && (n = a), [ [ "M", e, t ], [ "m", 0, -n ], [ "a", a, n, 0, 1, 1, 0, 2 * n ], [ "a", a, n, 0, 1, 1, 0, -2 * n ], [ "z" ] ];
}, se = L._getPath = {
path: function(e) {
return e.attr("path");
},
circle: function(e) {
var t = e.attrs;
return re(t.cx, t.cy, t.r);
},
ellipse: function(e) {
var t = e.attrs;
return re(t.cx, t.cy, t.rx, t.ry);
},
rect: function(e) {
var t = e.attrs;
return ie(t.x, t.y, t.width, t.height, t.r);
},
image: function(e) {
var t = e.attrs;
return ie(t.x, t.y, t.width, t.height);
},
text: function(e) {
var t = e._getBBox();
return ie(t.x, t.y, t.width, t.height);
}
}, oe = L.mapPath = function(e, t) {
if (!t) return e;
var a, n, i, r, s, o, p;
for (i = 0, s = (e = Se(e)).length; i < s; i++) for (r = 1, o = (p = e[i]).length; r < o; r += 2) a = t.x(p[r], p[r + 1]), 
n = t.y(p[r], p[r + 1]), p[r] = a, p[r + 1] = n;
return e;
};
if (L._g = m, L.type = m.win.SVGAngle || m.doc.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? "SVG" : "VML", 
"VML" == L.type) {
var pe, ce = m.doc.createElement("div");
if (ce.innerHTML = '<v:shape adj="1"/>', (pe = ce.firstChild).style.behavior = "url(#default#VML)", 
!pe || "object" != typeof pe.adj) return L.type = x;
ce = null;
}
L.svg = !(L.vml = "VML" == L.type), L._Paper = s, L.fn = e = s.prototype = L.prototype, 
L._id = 0, L._oid = 0, L.is = function(e, t) {
return "finite" == (t = A.call(t)) ? !S[E](+e) : "array" == t ? e instanceof Array : "null" == t && null === e || t == typeof e && null !== e || "object" == t && e === Object(e) || "array" == t && Array.isArray && Array.isArray(e) || h.call(e).slice(8, -1).toLowerCase() == t;
}, L.angle = function(e, t, a, n, i, r) {
if (null != i) return L.angle(e, t, i, r) - L.angle(a, n, i, r);
var s = e - a, o = t - n;
return s || o ? (180 + 180 * q.atan2(-o, -s) / U + 360) % 360 : 0;
}, L.rad = function(e) {
return e % 360 * U / 180;
}, L.deg = function(e) {
return 180 * e / U % 360;
}, L.snapTo = function(e, t, a) {
if (a = L.is(a, "finite") ? a : 10, L.is(e, y)) {
for (var n = e.length; n--; ) if (J(e[n] - t) <= a) return e[n];
} else {
var i = t % (e = +e);
if (i < a) return t - i;
if (e - a < i) return t - i + e;
}
return t;
};
var de, le;
L.createUUID = (de = /[xy]/g, le = function(e) {
var t = 16 * q.random() | 0;
return ("x" == e ? t : 3 & t | 8).toString(16);
}, function() {
return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(de, le).toUpperCase();
});
L.setWindow = function(e) {
eve("setWindow", L, m.win, e), m.win = e, m.doc = m.win.document, L._engine.initWin && L._engine.initWin(m.win);
};
var ue = function(e) {
if (L.vml) {
var a, n = /^\s+|\s+$/g;
try {
var t = new ActiveXObject("htmlfile");
t.write("<body>"), t.close(), a = t.body;
} catch (s) {
a = createPopup().document.body;
}
var i = a.createTextRange();
ue = z(function(e) {
try {
a.style.color = H(e).replace(n, x);
var t = i.queryCommandValue("ForeColor");
return "#" + ("000000" + (t = (255 & t) << 16 | 65280 & t | (16711680 & t) >>> 16).toString(16)).slice(-6);
} catch (s) {
return "none";
}
});
} else {
var r = m.doc.createElement("i");
r.title = "Rapha\xebl Colour Picker", r.style.display = "none", m.doc.body.appendChild(r), 
ue = z(function(e) {
return r.style.color = e, m.doc.defaultView.getComputedStyle(r, x).getPropertyValue("color");
});
}
return ue(e);
}, he = function() {
return "hsb(" + [ this.h, this.s, this.b ] + ")";
}, me = function() {
return "hsl(" + [ this.h, this.s, this.l ] + ")";
}, ge = function() {
return this.hex;
}, fe = function(e, t, a) {
if (null == t && L.is(e, "object") && "r" in e && "g" in e && "b" in e && (a = e.b, 
t = e.g, e = e.r), null == t && L.is(e, l)) {
var n = L.getRGB(e);
e = n.r, t = n.g, a = n.b;
}
return (1 < e || 1 < t || 1 < a) && (e /= 255, t /= 255, a /= 255), [ e, t, a ];
}, _e = function(e, t, a, n) {
var i = {
r: e *= 255,
g: t *= 255,
b: a *= 255,
hex: L.rgb(e, t, a),
toString: ge
};
return L.is(n, "finite") && (i.opacity = n), i;
};
L.color = function(e) {
var t;
return L.is(e, "object") && "h" in e && "s" in e && "b" in e ? (t = L.hsb2rgb(e), 
e.r = t.r, e.g = t.g, e.b = t.b, e.hex = t.hex) : L.is(e, "object") && "h" in e && "s" in e && "l" in e ? (t = L.hsl2rgb(e), 
e.r = t.r, e.g = t.g, e.b = t.b, e.hex = t.hex) : (L.is(e, "string") && (e = L.getRGB(e)), 
L.is(e, "object") && "r" in e && "g" in e && "b" in e ? (t = L.rgb2hsl(e), e.h = t.h, 
e.s = t.s, e.l = t.l, t = L.rgb2hsb(e), e.v = t.b) : (e = {
hex: "none"
}).r = e.g = e.b = e.h = e.s = e.v = e.l = -1), e.toString = ge, e;
}, L.hsb2rgb = function(e, t, a, n) {
var i, r, s, o, p;
return this.is(e, "object") && "h" in e && "s" in e && "b" in e && (a = e.b, t = e.s, 
n = (e = e.h).o), i = r = s = a - (p = a * t), i += [ p, o = p * (1 - J((e = (e *= 360) % 360 / 60) % 2 - 1)), 0, 0, o, p ][e = ~~e], 
r += [ o, p, p, o, 0, 0 ][e], s += [ 0, 0, o, p, p, o ][e], _e(i, r, s, n);
}, L.hsl2rgb = function(e, t, a, n) {
var i, r, s, o, p;
return this.is(e, "object") && "h" in e && "s" in e && "l" in e && (a = e.l, t = e.s, 
e = e.h), (1 < e || 1 < t || 1 < a) && (e /= 360, t /= 100, a /= 100), i = r = s = a - (p = 2 * t * (a < .5 ? a : 1 - a)) / 2, 
i += [ p, o = p * (1 - J((e = (e *= 360) % 360 / 60) % 2 - 1)), 0, 0, o, p ][e = ~~e], 
r += [ o, p, p, o, 0, 0 ][e], s += [ 0, 0, o, p, p, o ][e], _e(i, r, s, n);
}, L.rgb2hsb = function(e, t, a) {
var n, i;
return e = (a = fe(e, t, a))[0], t = a[1], a = a[2], {
h: ((0 == (i = (n = v(e, t, a)) - b(e, t, a)) ? null : n == e ? (t - a) / i : n == t ? (a - e) / i + 2 : (e - t) / i + 4) + 360) % 6 * 60 / 360,
s: 0 == i ? 0 : i / n,
b: n,
toString: he
};
}, L.rgb2hsl = function(e, t, a) {
var n, i, r, s;
return e = (a = fe(e, t, a))[0], t = a[1], a = a[2], n = ((i = v(e, t, a)) + (r = b(e, t, a))) / 2, 
{
h: ((0 == (s = i - r) ? null : i == e ? (t - a) / s : i == t ? (a - e) / s + 2 : (e - t) / s + 4) + 360) % 6 * 60 / 360,
s: 0 == s ? 0 : n < .5 ? s / (2 * n) : s / (2 - 2 * n),
l: n,
toString: me
};
}, L._path2string = function() {
return this.join(",").replace(P, "$1");
};
L._preload = function(e, t) {
var a = m.doc.createElement("img");
a.style.cssText = "position:absolute;left:-9999em;top:-9999em", a.onload = function() {
t.call(this), this.onload = null, m.doc.body.removeChild(this);
}, a.onerror = function() {
m.doc.body.removeChild(this);
}, m.doc.body.appendChild(a), a.src = e;
};
L.getRGB = z(function(e) {
if (!e || (e = H(e)).indexOf("-") + 1) return {
r: -1,
g: -1,
b: -1,
hex: "none",
error: 1,
toString: c
};
if ("none" == e) return {
r: -1,
g: -1,
b: -1,
hex: "none",
toString: c
};
!N[E](e.toLowerCase().substring(0, 2)) && "#" != e.charAt() && (e = ue(e));
var t, a, n, i, r, s, o = e.match(G);
return o ? (o[2] && (n = B(o[2].substring(5), 16), a = B(o[2].substring(3, 5), 16), 
t = B(o[2].substring(1, 3), 16)), o[3] && (n = B((r = o[3].charAt(3)) + r, 16), 
a = B((r = o[3].charAt(2)) + r, 16), t = B((r = o[3].charAt(1)) + r, 16)), o[4] && (s = o[4][F](I), 
t = R(s[0]), "%" == s[0].slice(-1) && (t *= 2.55), a = R(s[1]), "%" == s[1].slice(-1) && (a *= 2.55), 
n = R(s[2]), "%" == s[2].slice(-1) && (n *= 2.55), "rgba" == o[1].toLowerCase().slice(0, 4) && (i = R(s[3])), 
s[3] && "%" == s[3].slice(-1) && (i /= 100)), o[5] ? (s = o[5][F](I), t = R(s[0]), 
"%" == s[0].slice(-1) && (t *= 2.55), a = R(s[1]), "%" == s[1].slice(-1) && (a *= 2.55), 
n = R(s[2]), "%" == s[2].slice(-1) && (n *= 2.55), ("deg" == s[0].slice(-3) || "\xb0" == s[0].slice(-1)) && (t /= 360), 
"hsba" == o[1].toLowerCase().slice(0, 4) && (i = R(s[3])), s[3] && "%" == s[3].slice(-1) && (i /= 100), 
L.hsb2rgb(t, a, n, i)) : o[6] ? (s = o[6][F](I), t = R(s[0]), "%" == s[0].slice(-1) && (t *= 2.55), 
a = R(s[1]), "%" == s[1].slice(-1) && (a *= 2.55), n = R(s[2]), "%" == s[2].slice(-1) && (n *= 2.55), 
("deg" == s[0].slice(-3) || "\xb0" == s[0].slice(-1)) && (t /= 360), "hsla" == o[1].toLowerCase().slice(0, 4) && (i = R(s[3])), 
s[3] && "%" == s[3].slice(-1) && (i /= 100), L.hsl2rgb(t, a, n, i)) : ((o = {
r: t,
g: a,
b: n,
toString: c
}).hex = "#" + (16777216 | n | a << 8 | t << 16).toString(16).slice(1), L.is(i, "finite") && (o.opacity = i), 
o)) : {
r: -1,
g: -1,
b: -1,
hex: "none",
error: 1,
toString: c
};
}, L), L.hsb = z(function(e, t, a) {
return L.hsb2rgb(e, t, a).hex;
}), L.hsl = z(function(e, t, a) {
return L.hsl2rgb(e, t, a).hex;
}), L.rgb = z(function(e, t, a) {
return "#" + (16777216 | a | t << 8 | e << 16).toString(16).slice(1);
}), L.getColor = function(e) {
var t = this.getColor.start = this.getColor.start || {
h: 0,
s: 1,
b: e || .75
}, a = this.hsb2rgb(t.h, t.s, t.b);
return t.h += .075, 1 < t.h && (t.h = 0, t.s -= .2, t.s <= 0 && (this.getColor.start = {
h: 0,
s: 1,
b: t.b
})), a.hex;
}, L.getColor.reset = function() {
delete this.start;
}, L.parsePathString = z(function(e) {
if (!e) return null;
var r = {
a: 7,
c: 6,
h: 1,
l: 2,
m: 2,
r: 4,
q: 4,
s: 4,
t: 2,
v: 1,
z: 0
}, s = [];
return L.is(e, y) && L.is(e[0], y) && (s = ve(e)), s.length || H(e).replace(X, function(e, t, a) {
var n = [], i = t.toLowerCase();
if (a.replace(Z, function(e, t) {
t && n.push(+t);
}), "m" == i && 2 < n.length && (s.push([ t ][W](n.splice(0, 2))), i = "l", t = "m" == t ? "l" : "L"), 
"r" == i) s.push([ t ][W](n)); else for (;n.length >= r[i] && (s.push([ t ][W](n.splice(0, r[i]))), 
r[i]); ) ;
}), s.toString = L._path2string, s;
}), L.parseTransformString = z(function(e) {
if (!e) return null;
var i = [];
return L.is(e, y) && L.is(e[0], y) && (i = ve(e)), i.length || H(e).replace(Q, function(e, t, a) {
var n = [];
A.call(t);
a.replace(Z, function(e, t) {
t && n.push(+t);
}), i.push([ t ][W](n));
}), i.toString = L._path2string, i;
}), L.findDotsAtSegment = function(e, t, a, n, i, r, s, o, p) {
var c = 1 - p, d = C(c, 3), l = C(c, 2), u = p * p, h = u * p, m = d * e + 3 * l * p * a + 3 * c * p * p * i + h * s, g = d * t + 3 * l * p * n + 3 * c * p * p * r + h * o, f = e + 2 * p * (a - e) + u * (i - 2 * a + e), _ = t + 2 * p * (n - t) + u * (r - 2 * n + t), A = a + 2 * p * (i - a) + u * (s - 2 * i + a), v = n + 2 * p * (r - n) + u * (o - 2 * r + n), b = c * e + p * a, y = c * t + p * n, k = c * i + p * s, x = c * r + p * o, w = 90 - 180 * q.atan2(f - A, _ - v) / U;
return (A < f || _ < v) && (w += 180), {
x: m,
y: g,
m: {
x: f,
y: _
},
n: {
x: A,
y: v
},
start: {
x: b,
y: y
},
end: {
x: k,
y: x
},
alpha: w
};
}, L._removedFactory = function(e) {
return function() {
throw new Error("Rapha\xebl: you are calling to method \u201c" + e + "\u201d of removed object");
};
};
var Ae = z(function(e) {
if (!e) return {
x: 0,
y: 0,
width: 0,
height: 0
};
for (var t, a = 0, n = 0, i = [], r = [], s = 0, o = (e = Se(e)).length; s < o; s++) if ("M" == (t = e[s])[0]) a = t[1], 
n = t[2], i.push(a), r.push(n); else {
var p = Ge(a, n, t[1], t[2], t[3], t[4], t[5], t[6]);
i = i[W](p.min.x, p.max.x), r = r[W](p.min.y, p.max.y), a = t[5], n = t[6];
}
var c = b[f](0, i), d = b[f](0, r);
return {
x: c,
y: d,
width: v[f](0, i) - c,
height: v[f](0, r) - d
};
}, null, function(e) {
return {
x: e.x,
y: e.y,
width: e.width,
height: e.height
};
}), ve = function(e) {
var t = [];
L.is(e, y) && L.is(e && e[0], y) || (e = L.parsePathString(e));
for (var a = 0, n = e.length; a < n; a++) {
t[a] = [];
for (var i = 0, r = e[a].length; i < r; i++) t[a][i] = e[a][i];
}
return t.toString = L._path2string, t;
}, be = L._pathToRelative = z(function(e) {
L.is(e, y) && L.is(e && e[0], y) || (e = L.parsePathString(e));
var t = [], a = 0, n = 0, i = 0, r = 0, s = 0;
"M" == e[0][0] && (i = a = e[0][1], r = n = e[0][2], s++, t.push([ "M", a, n ]));
for (var o = s, p = e.length; o < p; o++) {
var c = t[o] = [], d = e[o];
if (d[0] != A.call(d[0])) switch (c[0] = A.call(d[0]), c[0]) {
case "a":
c[1] = d[1], c[2] = d[2], c[3] = d[3], c[4] = d[4], c[5] = d[5], c[6] = +(d[6] - a).toFixed(3), 
c[7] = +(d[7] - n).toFixed(3);
break;

case "v":
c[1] = +(d[1] - n).toFixed(3);
break;

case "m":
i = d[1], r = d[2];

default:
for (var l = 1, u = d.length; l < u; l++) c[l] = +(d[l] - (l % 2 ? a : n)).toFixed(3);
} else {
c = t[o] = [], "m" == d[0] && (i = d[1] + a, r = d[2] + n);
for (var h = 0, m = d.length; h < m; h++) t[o][h] = d[h];
}
var g = t[o].length;
switch (t[o][0]) {
case "z":
a = i, n = r;
break;

case "h":
a += +t[o][g - 1];
break;

case "v":
n += +t[o][g - 1];
break;

default:
a += +t[o][g - 2], n += +t[o][g - 1];
}
}
return t.toString = L._path2string, t;
}, 0, ve), ye = L._pathToAbsolute = z(function(e) {
if (L.is(e, y) && L.is(e && e[0], y) || (e = L.parsePathString(e)), !e || !e.length) return [ [ "M", 0, 0 ] ];
var t = [], a = 0, n = 0, i = 0, r = 0, s = 0;
"M" == e[0][0] && (i = a = +e[0][1], r = n = +e[0][2], s++, t[0] = [ "M", a, n ]);
for (var o, p, c = 3 == e.length && "M" == e[0][0] && "R" == e[1][0].toUpperCase() && "Z" == e[2][0].toUpperCase(), d = s, l = e.length; d < l; d++) {
if (t.push(o = []), (p = e[d])[0] != $.call(p[0])) switch (o[0] = $.call(p[0]), 
o[0]) {
case "A":
o[1] = p[1], o[2] = p[2], o[3] = p[3], o[4] = p[4], o[5] = p[5], o[6] = +(p[6] + a), 
o[7] = +(p[7] + n);
break;

case "V":
o[1] = +p[1] + n;
break;

case "H":
o[1] = +p[1] + a;
break;

case "R":
for (var u = [ a, n ][W](p.slice(1)), h = 2, m = u.length; h < m; h++) u[h] = +u[h] + a, 
u[++h] = +u[h] + n;
t.pop(), t = t[W](_(u, c));
break;

case "M":
i = +p[1] + a, r = +p[2] + n;

default:
for (h = 1, m = p.length; h < m; h++) o[h] = +p[h] + (h % 2 ? a : n);
} else if ("R" == p[0]) u = [ a, n ][W](p.slice(1)), t.pop(), t = t[W](_(u, c)), 
o = [ "R" ][W](p.slice(-2)); else for (var g = 0, f = p.length; g < f; g++) o[g] = p[g];
switch (o[0]) {
case "Z":
a = i, n = r;
break;

case "H":
a = o[1];
break;

case "V":
n = o[1];
break;

case "M":
i = o[o.length - 2], r = o[o.length - 1];

default:
a = o[o.length - 2], n = o[o.length - 1];
}
}
return t.toString = L._path2string, t;
}, null, ve), ke = function(e, t, a, n) {
return [ e, t, a, n, a, n ];
}, xe = function(e, t, a, n, i, r) {
var s = 1 / 3, o = 2 / 3;
return [ s * e + o * a, s * t + o * n, s * i + o * a, s * r + o * n, i, r ];
}, we = function(e, t, a, n, i, r, s, o, p, c) {
var d, l = 120 * U / 180, u = U / 180 * (+i || 0), h = [], m = z(function(e, t, a) {
return {
x: e * q.cos(a) - t * q.sin(a),
y: e * q.sin(a) + t * q.cos(a)
};
});
if (c) x = c[0], w = c[1], y = c[2], k = c[3]; else {
e = (d = m(e, t, -u)).x, t = d.y, o = (d = m(o, p, -u)).x, p = d.y;
q.cos(U / 180 * i), q.sin(U / 180 * i);
var g = (e - o) / 2, f = (t - p) / 2, _ = g * g / (a * a) + f * f / (n * n);
1 < _ && (a *= _ = q.sqrt(_), n *= _);
var A = a * a, v = n * n, b = (r == s ? -1 : 1) * q.sqrt(J((A * v - A * f * f - v * g * g) / (A * f * f + v * g * g))), y = b * a * f / n + (e + o) / 2, k = b * -n * g / a + (t + p) / 2, x = q.asin(((t - k) / n).toFixed(9)), w = q.asin(((p - k) / n).toFixed(9));
(x = e < y ? U - x : x) < 0 && (x = 2 * U + x), (w = o < y ? U - w : w) < 0 && (w = 2 * U + w), 
s && w < x && (x -= 2 * U), !s && x < w && (w -= 2 * U);
}
var C = w - x;
if (J(C) > l) {
var G = w, S = o, T = p;
w = x + l * (s && x < w ? 1 : -1), o = y + a * q.cos(w), p = k + n * q.sin(w), h = we(o, p, a, n, i, 0, s, S, T, [ w, G, y, k ]);
}
C = w - x;
var B = q.cos(x), $ = q.sin(x), I = q.cos(w), N = q.sin(w), P = q.tan(C / 4), L = 4 / 3 * a * P, M = 4 / 3 * n * P, D = [ e, t ], V = [ e + L * $, t - M * B ], E = [ o + L * N, p - M * I ], H = [ o, p ];
if (V[0] = 2 * D[0] - V[0], V[1] = 2 * D[1] - V[1], c) return [ V, E, H ][W](h);
for (var O = [], j = 0, R = (h = [ V, E, H ][W](h).join()[F](",")).length; j < R; j++) O[j] = j % 2 ? m(h[j - 1], h[j], u).y : m(h[j], h[j + 1], u).x;
return O;
}, Ce = function(e, t, a, n, i, r, s, o, p) {
var c = 1 - p;
return {
x: C(c, 3) * e + 3 * C(c, 2) * p * a + 3 * c * p * p * i + C(p, 3) * s,
y: C(c, 3) * t + 3 * C(c, 2) * p * n + 3 * c * p * p * r + C(p, 3) * o
};
}, Ge = z(function(e, t, a, n, i, r, s, o) {
var p, c = i - 2 * a + e - (s - 2 * i + a), d = 2 * (a - e) - 2 * (i - a), l = e - a, u = (-d + q.sqrt(d * d - 4 * c * l)) / 2 / c, h = (-d - q.sqrt(d * d - 4 * c * l)) / 2 / c, m = [ t, o ], g = [ e, s ];
return "1e12" < J(u) && (u = .5), "1e12" < J(h) && (h = .5), 0 < u && u < 1 && (p = Ce(e, t, a, n, i, r, s, o, u), 
g.push(p.x), m.push(p.y)), 0 < h && h < 1 && (p = Ce(e, t, a, n, i, r, s, o, h), 
g.push(p.x), m.push(p.y)), c = r - 2 * n + t - (o - 2 * r + n), l = t - n, u = (-(d = 2 * (n - t) - 2 * (r - n)) + q.sqrt(d * d - 4 * c * l)) / 2 / c, 
h = (-d - q.sqrt(d * d - 4 * c * l)) / 2 / c, "1e12" < J(u) && (u = .5), "1e12" < J(h) && (h = .5), 
0 < u && u < 1 && (p = Ce(e, t, a, n, i, r, s, o, u), g.push(p.x), m.push(p.y)), 
0 < h && h < 1 && (p = Ce(e, t, a, n, i, r, s, o, h), g.push(p.x), m.push(p.y)), 
{
min: {
x: b[f](0, g),
y: b[f](0, m)
},
max: {
x: v[f](0, g),
y: v[f](0, m)
}
};
}), Se = L._path2curve = z(function(e, t) {
for (var r = ye(e), s = t && ye(t), a = {
x: 0,
y: 0,
bx: 0,
by: 0,
X: 0,
Y: 0,
qx: null,
qy: null
}, n = {
x: 0,
y: 0,
bx: 0,
by: 0,
X: 0,
Y: 0,
qx: null,
qy: null
}, i = function(e, t) {
if (!e) return [ "C", t.x, t.y, t.x, t.y, t.x, t.y ];
switch (!(e[0] in {
T: 1,
Q: 1
}) && (t.qx = t.qy = null), e[0]) {
case "M":
t.X = e[1], t.Y = e[2];
break;

case "A":
e = [ "C" ][W](we[f](0, [ t.x, t.y ][W](e.slice(1))));
break;

case "S":
e = [ "C", t.x + (t.x - (t.bx || t.x)), t.y + (t.y - (t.by || t.y)) ][W](e.slice(1));
break;

case "T":
t.qx = t.x + (t.x - (t.qx || t.x)), t.qy = t.y + (t.y - (t.qy || t.y)), e = [ "C" ][W](xe(t.x, t.y, t.qx, t.qy, e[1], e[2]));
break;

case "Q":
t.qx = e[1], t.qy = e[2], e = [ "C" ][W](xe(t.x, t.y, e[1], e[2], e[3], e[4]));
break;

case "L":
e = [ "C" ][W](ke(t.x, t.y, e[1], e[2]));
break;

case "H":
e = [ "C" ][W](ke(t.x, t.y, e[1], t.y));
break;

case "V":
e = [ "C" ][W](ke(t.x, t.y, t.x, e[1]));
break;

case "Z":
e = [ "C" ][W](ke(t.x, t.y, t.X, t.Y));
}
return e;
}, o = function(e, t) {
if (7 < e[t].length) {
e[t].shift();
for (var a = e[t]; a.length; ) e.splice(t++, 0, [ "C" ][W](a.splice(0, 6)));
e.splice(t, 1), d = v(r.length, s && s.length || 0);
}
}, p = function(e, t, a, n, i) {
e && t && "M" == e[i][0] && "M" != t[i][0] && (t.splice(i, 0, [ "M", n.x, n.y ]), 
a.bx = 0, a.by = 0, a.x = e[i][1], a.y = e[i][2], d = v(r.length, s && s.length || 0));
}, c = 0, d = v(r.length, s && s.length || 0); c < d; c++) {
r[c] = i(r[c], a), o(r, c), s && (s[c] = i(s[c], n)), s && o(s, c), p(r, s, a, n, c), 
p(s, r, n, a, c);
var l = r[c], u = s && s[c], h = l.length, m = s && u.length;
a.x = l[h - 2], a.y = l[h - 1], a.bx = R(l[h - 4]) || a.x, a.by = R(l[h - 3]) || a.y, 
n.bx = s && (R(u[m - 4]) || n.x), n.by = s && (R(u[m - 3]) || n.y), n.x = s && u[m - 2], 
n.y = s && u[m - 1];
}
return s ? [ r, s ] : r;
}, null, ve), Te = (L._parseDots = z(function(e) {
for (var t = [], a = 0, n = e.length; a < n; a++) {
var i = {}, r = e[a].match(/^([^:]*):?([\d\.]*)/);
if (i.color = L.getRGB(r[1]), i.color.error) return null;
i.color = i.color.hex, r[2] && (i.offset = r[2] + "%"), t.push(i);
}
for (a = 1, n = t.length - 1; a < n; a++) if (!t[a].offset) {
for (var s = R(t[a - 1].offset || 0), o = 0, p = a + 1; p < n; p++) if (t[p].offset) {
o = t[p].offset;
break;
}
o || (o = 100, p = n);
for (var c = ((o = R(o)) - s) / (p - a + 1); a < p; a++) s += c, t[a].offset = s + "%";
}
return t;
}), L._tear = function(e, t) {
e == t.top && (t.top = e.prev), e == t.bottom && (t.bottom = e.next), e.next && (e.next.prev = e.prev), 
e.prev && (e.prev.next = e.next);
}), Be = (L._tofront = function(e, t) {
t.top !== e && (Te(e, t), e.next = null, e.prev = t.top, t.top.next = e, t.top = e);
}, L._toback = function(e, t) {
t.bottom !== e && (Te(e, t), e.next = t.bottom, e.prev = null, t.bottom.prev = e, 
t.bottom = e);
}, L._insertafter = function(e, t, a) {
Te(e, a), t == a.top && (a.top = e), t.next && (t.next.prev = e), e.next = t.next, 
(e.prev = t).next = e;
}, L._insertbefore = function(e, t, a) {
Te(e, a), t == a.bottom && (a.bottom = e), t.prev && (t.prev.next = e), e.prev = t.prev, 
(t.prev = e).next = t;
}, L._extractTransform = function(e, t) {
if (null == t) return e._.transform;
t = H(t).replace(/\.{3}|\u2026/g, e._.transform || x);
var a = L.parseTransformString(t), n = 0, i = 0, r = 0, s = 1, o = 1, p = e._, c = new M();
if (p.transform = a || [], a) for (var d = 0, l = a.length; d < l; d++) {
var u, h, m, g, f, _ = a[d], A = _.length, v = H(_[0]).toLowerCase(), b = _[0] != v, y = b ? c.invert() : 0;
"t" == v && 3 == A ? b ? (u = y.x(0, 0), h = y.y(0, 0), m = y.x(_[1], _[2]), g = y.y(_[1], _[2]), 
c.translate(m - u, g - h)) : c.translate(_[1], _[2]) : "r" == v ? 2 == A ? (f = f || e.getBBox(1), 
c.rotate(_[1], f.x + f.width / 2, f.y + f.height / 2), n += _[1]) : 4 == A && (b ? (m = y.x(_[2], _[3]), 
g = y.y(_[2], _[3]), c.rotate(_[1], m, g)) : c.rotate(_[1], _[2], _[3]), n += _[1]) : "s" == v ? 2 == A || 3 == A ? (f = f || e.getBBox(1), 
c.scale(_[1], _[A - 1], f.x + f.width / 2, f.y + f.height / 2), s *= _[1], o *= _[A - 1]) : 5 == A && (b ? (m = y.x(_[3], _[4]), 
g = y.y(_[3], _[4]), c.scale(_[1], _[2], m, g)) : c.scale(_[1], _[2], _[3], _[4]), 
s *= _[1], o *= _[2]) : "m" == v && 7 == A && c.add(_[1], _[2], _[3], _[4], _[5], _[6]), 
p.dirtyT = 1, e.matrix = c;
}
e.matrix = c, p.sx = s, p.sy = o, p.deg = n, p.dx = i = c.e, p.dy = r = c.f, 1 == s && 1 == o && !n && p.bbox ? (p.bbox.x += +i, 
p.bbox.y += +r) : p.dirtyT = 1;
}), $e = function(e) {
var t = e[0];
switch (t.toLowerCase()) {
case "t":
return [ t, 0, 0 ];

case "m":
return [ t, 1, 0, 0, 1, 0, 0 ];

case "r":
return 4 == e.length ? [ t, 0, e[2], e[3] ] : [ t, 0 ];

case "s":
return 5 == e.length ? [ t, 1, 1, e[3], e[4] ] : 3 == e.length ? [ t, 1, 1 ] : [ t, 1 ];
}
}, Ie = L._equaliseTransform = function(e, t) {
t = H(t).replace(/\.{3}|\u2026/g, e), e = L.parseTransformString(e) || [], t = L.parseTransformString(t) || [];
for (var a, n, i, r, s = v(e.length, t.length), o = [], p = [], c = 0; c < s; c++) {
if (i = e[c] || $e(t[c]), r = t[c] || $e(i), i[0] != r[0] || "r" == i[0].toLowerCase() && (i[2] != r[2] || i[3] != r[3]) || "s" == i[0].toLowerCase() && (i[3] != r[3] || i[4] != r[4])) return;
for (o[c] = [], p[c] = [], a = 0, n = v(i.length, r.length); a < n; a++) a in i && (o[c][a] = i[a]), 
a in r && (p[c][a] = r[a]);
}
return {
from: o,
to: p
};
};
L._getContainer = function(e, t, a, n) {
var i;
if (null != (i = null != n || L.is(e, "object") ? e : m.doc.getElementById(e))) return i.tagName ? null == t ? {
container: i,
width: i.style.pixelWidth || i.offsetWidth,
height: i.style.pixelHeight || i.offsetHeight
} : {
container: i,
width: t,
height: a
} : {
container: 1,
x: e,
y: t,
width: a,
height: n
};
}, L.pathToRelative = be, L._engine = {}, L.path2curve = Se, L.matrix = function(e, t, a, n, i, r) {
return new M(e, t, a, n, i, r);
}, function(e) {
function i(e) {
return e[0] * e[0] + e[1] * e[1];
}
function r(e) {
var t = q.sqrt(i(e));
e[0] && (e[0] /= t), e[1] && (e[1] /= t);
}
e.add = function(e, t, a, n, i, r) {
var s, o, p, c, d = [ [], [], [] ], l = [ [ this.a, this.c, this.e ], [ this.b, this.d, this.f ], [ 0, 0, 1 ] ], u = [ [ e, a, i ], [ t, n, r ], [ 0, 0, 1 ] ];
for (e && e instanceof M && (u = [ [ e.a, e.c, e.e ], [ e.b, e.d, e.f ], [ 0, 0, 1 ] ]), 
s = 0; s < 3; s++) for (o = 0; o < 3; o++) {
for (p = c = 0; p < 3; p++) c += l[s][p] * u[p][o];
d[s][o] = c;
}
this.a = d[0][0], this.b = d[1][0], this.c = d[0][1], this.d = d[1][1], this.e = d[0][2], 
this.f = d[1][2];
}, e.invert = function() {
var e = this, t = e.a * e.d - e.b * e.c;
return new M(e.d / t, -e.b / t, -e.c / t, e.a / t, (e.c * e.f - e.d * e.e) / t, (e.b * e.e - e.a * e.f) / t);
}, e.clone = function() {
return new M(this.a, this.b, this.c, this.d, this.e, this.f);
}, e.translate = function(e, t) {
this.add(1, 0, 0, 1, e, t);
}, e.scale = function(e, t, a, n) {
null == t && (t = e), (a || n) && this.add(1, 0, 0, 1, a, n), this.add(e, 0, 0, t, 0, 0), 
(a || n) && this.add(1, 0, 0, 1, -a, -n);
}, e.rotate = function(e, t, a) {
e = L.rad(e), t = t || 0, a = a || 0;
var n = +q.cos(e).toFixed(9), i = +q.sin(e).toFixed(9);
this.add(n, i, -i, n, t, a), this.add(1, 0, 0, 1, -t, -a);
}, e.x = function(e, t) {
return e * this.a + t * this.c + this.e;
}, e.y = function(e, t) {
return e * this.b + t * this.d + this.f;
}, e.get = function(e) {
return +this[H.fromCharCode(97 + e)].toFixed(4);
}, e.toString = function() {
return L.svg ? "matrix(" + [ this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5) ].join() + ")" : [ this.get(0), this.get(2), this.get(1), this.get(3), 0, 0 ].join();
}, e.toFilter = function() {
return "progid:DXImageTransform.Microsoft.Matrix(M11=" + this.get(0) + ", M12=" + this.get(2) + ", M21=" + this.get(1) + ", M22=" + this.get(3) + ", Dx=" + this.get(4) + ", Dy=" + this.get(5) + ", sizingmethod='auto expand')";
}, e.offset = function() {
return [ this.e.toFixed(4), this.f.toFixed(4) ];
}, e.split = function() {
var e = {};
e.dx = this.e, e.dy = this.f;
var t = [ [ this.a, this.c ], [ this.b, this.d ] ];
e.scalex = q.sqrt(i(t[0])), r(t[0]), e.shear = t[0][0] * t[1][0] + t[0][1] * t[1][1], 
t[1] = [ t[1][0] - t[0][0] * e.shear, t[1][1] - t[0][1] * e.shear ], e.scaley = q.sqrt(i(t[1])), 
r(t[1]), e.shear /= e.scaley;
var a = -t[0][1], n = t[1][1];
return n < 0 ? (e.rotate = L.deg(q.acos(n)), a < 0 && (e.rotate = 360 - e.rotate)) : e.rotate = L.deg(q.asin(a)), 
e.isSimple = !(+e.shear.toFixed(9) || e.scalex.toFixed(9) != e.scaley.toFixed(9) && e.rotate), 
e.isSuperSimple = !+e.shear.toFixed(9) && e.scalex.toFixed(9) == e.scaley.toFixed(9) && !e.rotate, 
e.noRotation = !+e.shear.toFixed(9) && !e.rotate, e;
}, e.toTransformString = function(e) {
var t = e || this[F]();
return t.isSimple ? (t.scalex = +t.scalex.toFixed(4), t.scaley = +t.scaley.toFixed(4), 
t.rotate = +t.rotate.toFixed(4), (t.dx || t.dy ? "t" + [ t.dx, t.dy ] : x) + (1 != t.scalex || 1 != t.scaley ? "s" + [ t.scalex, t.scaley, 0, 0 ] : x) + (t.rotate ? "r" + [ t.rotate, 0, 0 ] : x)) : "m" + [ this.get(0), this.get(1), this.get(2), this.get(3), this.get(4), this.get(5) ];
};
}(M.prototype);
var Ne = navigator.userAgent.match(/Version\/(.*?)\s/) || navigator.userAgent.match(/Chrome\/(\d+)/);
"Apple Computer, Inc." == navigator.vendor && (Ne && Ne[1] < 4 || "iP" == navigator.platform.slice(0, 2)) || "Google Inc." == navigator.vendor && Ne && Ne[1] < 8 ? e.safari = function() {
var e = this.rect(-99, -99, this.width + 99, this.height + 99).attr({
stroke: "none"
});
setTimeout(function() {
e.remove();
});
} : e.safari = ae;
for (var Pe = function() {
this.returnValue = !1;
}, Le = function() {
return this.originalEvent.preventDefault();
}, Me = function() {
this.cancelBubble = !0;
}, De = function() {
return this.originalEvent.stopPropagation();
}, Ve = m.doc.addEventListener ? function(p, c, d, l) {
var e = g && u[c] ? u[c] : c, t = function(e) {
var t = m.doc.documentElement.scrollTop || m.doc.body.scrollTop, a = m.doc.documentElement.scrollLeft || m.doc.body.scrollLeft, n = e.clientX + a, i = e.clientY + t;
if (g && u[E](c)) for (var r = 0, s = e.targetTouches && e.targetTouches.length; r < s; r++) if (e.targetTouches[r].target == p) {
var o = e;
(e = e.targetTouches[r]).originalEvent = o, e.preventDefault = Le, e.stopPropagation = De;
break;
}
return d.call(l, e, n, i);
};
return p.addEventListener(e, t, !1), function() {
return p.removeEventListener(e, t, !1), !0;
};
} : m.doc.attachEvent ? function(e, t, r, s) {
var a = function(e) {
e = e || m.win.event;
var t = m.doc.documentElement.scrollTop || m.doc.body.scrollTop, a = m.doc.documentElement.scrollLeft || m.doc.body.scrollLeft, n = e.clientX + a, i = e.clientY + t;
return e.preventDefault = e.preventDefault || Pe, e.stopPropagation = e.stopPropagation || Me, 
r.call(s, e, n, i);
};
return e.attachEvent("on" + t, a), function() {
return e.detachEvent("on" + t, a), !0;
};
} : void 0, Ee = [], He = function(e) {
for (var t, a = e.clientX, n = e.clientY, i = m.doc.documentElement.scrollTop || m.doc.body.scrollTop, r = m.doc.documentElement.scrollLeft || m.doc.body.scrollLeft, s = Ee.length; s--; ) {
if (t = Ee[s], g) {
for (var o, p = e.touches.length; p--; ) if ((o = e.touches[p]).identifier == t.el._drag.id) {
a = o.clientX, n = o.clientY, (e.originalEvent ? e.originalEvent : e).preventDefault();
break;
}
} else e.preventDefault();
var c, d = t.el.node, l = d.nextSibling, u = d.parentNode, h = d.style.display;
m.win.opera && u.removeChild(d), d.style.display = "none", c = t.el.paper.getElementByPoint(a, n), 
d.style.display = h, m.win.opera && (l ? u.insertBefore(d, l) : u.appendChild(d)), 
c && eve("drag.over." + t.el.id, t.el, c), a += r, n += i, eve("drag.move." + t.el.id, t.move_scope || t.el, a - t.el._drag.x, n - t.el._drag.y, a, n, e);
}
}, Oe = function(e) {
L.unmousemove(He).unmouseup(Oe);
for (var t, a = Ee.length; a--; ) (t = Ee[a]).el._drag = {}, eve("drag.end." + t.el.id, t.end_scope || t.start_scope || t.move_scope || t.el, e);
Ee = [];
}, je = L.el = {}, Re = o.length; Re--; ) !function(n) {
L[n] = je[n] = function(e, t) {
return L.is(e, "function") && (this.events = this.events || [], this.events.push({
name: n,
f: e,
unbind: Ve(this.shape || this.node || m.doc, n, e, t || this)
})), this;
}, L["un" + n] = je["un" + n] = function(e) {
for (var t = this.events || [], a = t.length; a--; ) if (t[a].name == n && t[a].f == e) return t[a].unbind(), 
t.splice(a, 1), !t.length && delete this.events, this;
return this;
};
}(o[Re]);
je.data = function(e, t) {
var a = ee[this.id] = ee[this.id] || {};
if (1 != arguments.length) return a[e] = t, eve("data.set." + this.id, this, t, e), 
this;
if (L.is(e, "object")) {
for (var n in e) e[E](n) && this.data(n, e[n]);
return this;
}
return eve("data.get." + this.id, this, a[e], e), a[e];
}, je.removeData = function(e) {
return null == e ? ee[this.id] = {} : ee[this.id] && delete ee[this.id][e], this;
}, je.hover = function(e, t, a, n) {
return this.mouseover(e, a).mouseout(t, n || a);
}, je.unhover = function(e, t) {
return this.unmouseover(e).unmouseout(t);
};
var ze = [];
je.drag = function(n, i, r, s, o, p) {
function e(e) {
(e.originalEvent || e).preventDefault();
var t = m.doc.documentElement.scrollTop || m.doc.body.scrollTop, a = m.doc.documentElement.scrollLeft || m.doc.body.scrollLeft;
this._drag.x = e.clientX + a, this._drag.y = e.clientY + t, this._drag.id = e.identifier, 
!Ee.length && L.mousemove(He).mouseup(Oe), Ee.push({
el: this,
move_scope: s,
start_scope: o,
end_scope: p
}), i && eve.on("drag.start." + this.id, i), n && eve.on("drag.move." + this.id, n), 
r && eve.on("drag.end." + this.id, r), eve("drag.start." + this.id, o || s || this, e.clientX + a, e.clientY + t, e);
}
return this._drag = {}, ze.push({
el: this,
start: e
}), this.mousedown(e), this;
}, je.onDragOver = function(e) {
e ? eve.on("drag.over." + this.id, e) : eve.unbind("drag.over." + this.id);
}, je.undrag = function() {
for (var e = ze.length; e--; ) ze[e].el == this && (this.unmousedown(ze[e].start), 
ze.splice(e, 1), eve.unbind("drag.*." + this.id));
!ze.length && L.unmousemove(He).unmouseup(Oe);
}, e.circle = function(e, t, a) {
var n = L._engine.circle(this, e || 0, t || 0, a || 0);
return this.__set__ && this.__set__.push(n), n;
}, e.rect = function(e, t, a, n, i) {
var r = L._engine.rect(this, e || 0, t || 0, a || 0, n || 0, i || 0);
return this.__set__ && this.__set__.push(r), r;
}, e.ellipse = function(e, t, a, n) {
var i = L._engine.ellipse(this, e || 0, t || 0, a || 0, n || 0);
return this.__set__ && this.__set__.push(i), i;
}, e.path = function(e) {
e && !L.is(e, l) && !L.is(e[0], y) && (e += x);
var t = L._engine.path(L.format[f](L, arguments), this);
return this.__set__ && this.__set__.push(t), t;
}, e.image = function(e, t, a, n, i) {
var r = L._engine.image(this, e || "about:blank", t || 0, a || 0, n || 0, i || 0);
return this.__set__ && this.__set__.push(r), r;
}, e.text = function(e, t, a) {
var n = L._engine.text(this, e || 0, t || 0, H(a));
return this.__set__ && this.__set__.push(n), n;
}, e.set = function(e) {
!L.is(e, "array") && (e = Array.prototype.splice.call(arguments, 0, arguments.length));
var t = new rt(e);
return this.__set__ && this.__set__.push(t), t;
}, e.setStart = function(e) {
this.__set__ = e || this.set();
}, e.setFinish = function() {
var e = this.__set__;
return delete this.__set__, e;
}, e.setSize = function(e, t) {
return L._engine.setSize.call(this, e, t);
}, e.setViewBox = function(e, t, a, n, i) {
return L._engine.setViewBox.call(this, e, t, a, n, i);
}, e.top = e.bottom = null, e.raphael = L;
var We = function(e) {
var t = e.getBoundingClientRect(), a = e.ownerDocument, n = a.body, i = a.documentElement, r = i.clientTop || n.clientTop || 0, s = i.clientLeft || n.clientLeft || 0;
return {
y: t.top + (m.win.pageYOffset || i.scrollTop || n.scrollTop) - r,
x: t.left + (m.win.pageXOffset || i.scrollLeft || n.scrollLeft) - s
};
};
e.getElementByPoint = function(e, t) {
var a = this, n = a.canvas, i = m.doc.elementFromPoint(e, t);
if (m.win.opera && "svg" == i.tagName) {
var r = We(n), s = n.createSVGRect();
s.x = e - r.x, s.y = t - r.y, s.width = s.height = 1;
var o = n.getIntersectionList(s, null);
o.length && (i = o[o.length - 1]);
}
if (!i) return null;
for (;i.parentNode && i != n.parentNode && !i.raphael; ) i = i.parentNode;
return i == a.canvas.parentNode && (i = n), i = i && i.raphael ? a.getById(i.raphaelid) : null;
}, e.getById = function(e) {
for (var t = this.bottom; t; ) {
if (t.id == e) return t;
t = t.next;
}
return null;
}, e.forEach = function(e, t) {
for (var a = this.bottom; a; ) {
if (!1 === e.call(t, a)) return this;
a = a.next;
}
return this;
}, je.getBBox = function(e) {
if (this.removed) return {};
var t = this._;
return e ? (!t.dirty && t.bboxwt || (this.realPath = se[this.type](this), t.bboxwt = Ae(this.realPath), 
t.bboxwt.toString = a, t.dirty = 0), t.bboxwt) : ((t.dirty || t.dirtyT || !t.bbox) && (!t.dirty && this.realPath || (t.bboxwt = 0, 
this.realPath = se[this.type](this)), t.bbox = Ae(oe(this.realPath, this.matrix)), 
t.bbox.toString = a, t.dirty = t.dirtyT = 0), t.bbox);
}, je.clone = function() {
if (this.removed) return null;
var e = this.paper[this.type]().attr(this.attr());
return this.__set__ && this.__set__.push(e), e;
}, je.glow = function(e) {
if ("text" == this.type) return null;
var t = {
width: ((e = e || {}).width || 10) + (+this.attr("stroke-width") || 1),
fill: e.fill || !1,
opacity: e.opacity || .5,
offsetx: e.offsetx || 0,
offsety: e.offsety || 0,
color: e.color || "#000"
}, a = t.width / 2, n = this.paper, i = n.set(), r = this.realPath || se[this.type](this);
r = this.matrix ? oe(r, this.matrix) : r;
for (var s = 1; s < a + 1; s++) i.push(n.path(r).attr({
stroke: t.color,
fill: t.fill ? t.color : "none",
"stroke-linejoin": "round",
"stroke-linecap": "round",
"stroke-width": +(t.width / a * s).toFixed(3),
opacity: +(t.opacity / a).toFixed(3)
}));
return i.insertBefore(this).translate(t.offsetx, t.offsety);
};
var Fe = {}, qe = function(e, t, a, n, i, r, s, o, p) {
var c, d, l = 0, u = 100, h = [ e, t, a, n, i, r, s, o ].join(), m = Fe[h];
if (!m && (Fe[h] = m = {
data: []
}), m.timer && clearTimeout(m.timer), m.timer = setTimeout(function() {
delete Fe[h];
}, 2e3), null != p && !m.precision) {
var g = qe(e, t, a, n, i, r, s, o);
m.precision = 10 * ~~g, m.data = [];
}
u = m.precision || u;
for (var f = 0; f < u + 1; f++) {
if (m.data[f * u] ? d = m.data[f * u] : (d = L.findDotsAtSegment(e, t, a, n, i, r, s, o, f / u), 
m.data[f * u] = d), f && (l += C(C(c.x - d.x, 2) + C(c.y - d.y, 2), .5)), null != p && p <= l) return d;
c = d;
}
if (null == p) return l;
}, Je = function(h, m) {
return function(e, t, a) {
for (var n, i, r, s, o, p = "", c = {}, d = 0, l = 0, u = (e = Se(e)).length; l < u; l++) {
if ("M" == (r = e[l])[0]) n = +r[1], i = +r[2]; else {
if (t < d + (s = qe(n, i, r[1], r[2], r[3], r[4], r[5], r[6]))) {
if (m && !c.start) {
if (p += [ "C" + (o = qe(n, i, r[1], r[2], r[3], r[4], r[5], r[6], t - d)).start.x, o.start.y, o.m.x, o.m.y, o.x, o.y ], 
a) return p;
c.start = p, p = [ "M" + o.x, o.y + "C" + o.n.x, o.n.y, o.end.x, o.end.y, r[5], r[6] ].join(), 
d += s, n = +r[5], i = +r[6];
continue;
}
if (!h && !m) return {
x: (o = qe(n, i, r[1], r[2], r[3], r[4], r[5], r[6], t - d)).x,
y: o.y,
alpha: o.alpha
};
}
d += s, n = +r[5], i = +r[6];
}
p += r.shift() + r;
}
return c.end = p, (o = h ? d : m ? c : L.findDotsAtSegment(n, i, r[0], r[1], r[2], r[3], r[4], r[5], 1)).alpha && (o = {
x: o.x,
y: o.y,
alpha: o.alpha
}), o;
};
}, Ue = Je(1), Ke = Je(), Ye = Je(0, 1);
L.getTotalLength = Ue, L.getPointAtLength = Ke, L.getSubpath = function(e, t, a) {
if (this.getTotalLength(e) - a < 1e-6) return Ye(e, t).end;
var n = Ye(e, a, 1);
return t ? Ye(n, t).end : n;
}, je.getTotalLength = function() {
if ("path" == this.type) return this.node.getTotalLength ? this.node.getTotalLength() : Ue(this.attrs.path);
}, je.getPointAtLength = function(e) {
if ("path" == this.type) return Ke(this.attrs.path, e);
}, je.getSubpath = function(e, t) {
if ("path" == this.type) return L.getSubpath(this.attrs.path, e, t);
};
var Xe = L.easing_formulas = {
linear: function(e) {
return e;
},
"<": function(e) {
return C(e, 1.7);
},
">": function(e) {
return C(e, .48);
},
"<>": function(e) {
var t = .48 - e / 1.04, a = q.sqrt(.1734 + t * t), n = a - t, i = -a - t, r = C(J(n), 1 / 3) * (n < 0 ? -1 : 1) + C(J(i), 1 / 3) * (i < 0 ? -1 : 1) + .5;
return 3 * (1 - r) * r * r + r * r * r;
},
backIn: function(e) {
var t = 1.70158;
return e * e * ((t + 1) * e - t);
},
backOut: function(e) {
var t = 1.70158;
return (e -= 1) * e * ((t + 1) * e + t) + 1;
},
elastic: function(e) {
return e == !!e ? e : C(2, -10 * e) * q.sin(2 * U * (e - .075) / .3) + 1;
},
bounce: function(e) {
var t = 7.5625, a = 2.75;
return e < 1 / a ? t * e * e : e < 2 / a ? t * (e -= 1.5 / a) * e + .75 : e < 2.5 / a ? t * (e -= 2.25 / a) * e + .9375 : t * (e -= 2.625 / a) * e + .984375;
}
};
Xe.easeIn = Xe["ease-in"] = Xe["<"], Xe.easeOut = Xe["ease-out"] = Xe[">"], Xe.easeInOut = Xe["ease-in-out"] = Xe["<>"], 
Xe["back-in"] = Xe.backIn, Xe["back-out"] = Xe.backOut;
var Qe = [], Ze = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function(e) {
setTimeout(e, 16);
}, et = function() {
for (var e = +new Date(), t = 0; t < Qe.length; t++) {
var a = Qe[t];
if (!a.el.removed && !a.paused) {
var n, i, r = e - a.start, s = a.ms, o = a.easing, p = a.from, c = a.diff, d = a.to, l = (a.t, 
a.el), u = {}, h = {};
if (a.initstatus ? (r = (a.initstatus * a.anim.top - a.prev) / (a.percent - a.prev) * s, 
a.status = a.initstatus, delete a.initstatus, a.stop && Qe.splice(t--, 1)) : a.status = (a.prev + (a.percent - a.prev) * (r / s)) / a.anim.top, 
!(r < 0)) if (r < s) {
var m = o(r / s);
for (var g in p) if (p[E](g)) {
switch (Y[g]) {
case O:
n = +p[g] + m * s * c[g];
break;

case "colour":
n = "rgb(" + [ tt(T(p[g].r + m * s * c[g].r)), tt(T(p[g].g + m * s * c[g].g)), tt(T(p[g].b + m * s * c[g].b)) ].join(",") + ")";
break;

case "path":
n = [];
for (var f = 0, _ = p[g].length; f < _; f++) {
n[f] = [ p[g][f][0] ];
for (var A = 1, v = p[g][f].length; A < v; A++) n[f][A] = +p[g][f][A] + m * s * c[g][f][A];
n[f] = n[f].join(w);
}
n = n.join(w);
break;

case "transform":
if (c[g].real) for (n = [], f = 0, _ = p[g].length; f < _; f++) for (n[f] = [ p[g][f][0] ], 
A = 1, v = p[g][f].length; A < v; A++) n[f][A] = p[g][f][A] + m * s * c[g][f][A]; else {
var b = function(e) {
return +p[g][e] + m * s * c[g][e];
};
n = [ [ "m", b(0), b(1), b(2), b(3), b(4), b(5) ] ];
}
break;

case "csv":
if ("clip-rect" == g) for (n = [], f = 4; f--; ) n[f] = +p[g][f] + m * s * c[g][f];
break;

default:
var y = [][W](p[g]);
for (n = [], f = l.paper.customAttributes[g].length; f--; ) n[f] = +y[f] + m * s * c[g][f];
}
u[g] = n;
}
l.attr(u), function(e, t, a) {
setTimeout(function() {
eve("anim.frame." + e, t, a);
});
}(l.id, l, a.anim);
} else {
if (function(e, t, a) {
setTimeout(function() {
eve("anim.frame." + t.id, t, a), eve("anim.finish." + t.id, t, a), L.is(e, "function") && e.call(t);
});
}(a.callback, l, a.anim), l.attr(d), Qe.splice(t--, 1), 1 < a.repeat && !a.next) {
for (i in d) d[E](i) && (h[i] = a.totalOrigin[i]);
a.el.attr(h), k(a.anim, a.el, a.anim.percents[0], null, a.totalOrigin, a.repeat - 1);
}
a.next && !a.stop && k(a.anim, a.el, a.next, null, a.totalOrigin, a.repeat);
}
}
}
L.svg && l && l.paper && l.paper.safari(), Qe.length && Ze(et);
}, tt = function(e) {
return 255 < e ? 255 : e < 0 ? 0 : e;
};
je.animateWith = function(e, t, a, n, i, r) {
var s = this;
if (s.removed) return r && r.call(s), s;
var o = a instanceof d ? a : L.animation(a, n, i, r);
k(o, s, o.percents[0], null, s.attr());
for (var p = 0, c = Qe.length; p < c; p++) if (Qe[p].anim == t && Qe[p].el == e) {
Qe[c - 1].start = Qe[p].start;
break;
}
return s;
}, je.onAnimation = function(e) {
return e ? eve.on("anim.frame." + this.id, e) : eve.unbind("anim.frame." + this.id), 
this;
}, d.prototype.delay = function(e) {
var t = new d(this.anim, this.ms);
return t.times = this.times, t.del = +e || 0, t;
}, d.prototype.repeat = function(e) {
var t = new d(this.anim, this.ms);
return t.del = this.del, t.times = q.floor(v(e, 0)) || 1, t;
}, L.animation = function(e, t, a, n) {
if (e instanceof d) return e;
!L.is(a, "function") && a || (n = n || a || null, a = null), e = Object(e), t = +t || 0;
var i, r, s = {};
for (r in e) e[E](r) && R(r) != r && R(r) + "%" != r && (i = !0, s[r] = e[r]);
return i ? (a && (s.easing = a), n && (s.callback = n), new d({
100: s
}, t)) : new d(e, t);
}, je.animate = function(e, t, a, n) {
var i = this;
if (i.removed) return n && n.call(i), i;
var r = e instanceof d ? e : L.animation(e, t, a, n);
return k(r, i, r.percents[0], null, i.attr()), i;
}, je.setTime = function(e, t) {
return e && null != t && this.status(e, b(t, e.ms) / e.ms), this;
}, je.status = function(e, t) {
var a, n, i = [], r = 0;
if (null != t) return k(e, this, -1, b(t, 1)), this;
for (a = Qe.length; r < a; r++) if ((n = Qe[r]).el.id == this.id && (!e || n.anim == e)) {
if (e) return n.status;
i.push({
anim: n.anim,
status: n.status
});
}
return e ? 0 : i;
}, je.pause = function(e) {
for (var t = 0; t < Qe.length; t++) Qe[t].el.id != this.id || e && Qe[t].anim != e || !1 !== eve("anim.pause." + this.id, this, Qe[t].anim) && (Qe[t].paused = !0);
return this;
}, je.resume = function(e) {
for (var t = 0; t < Qe.length; t++) if (Qe[t].el.id == this.id && (!e || Qe[t].anim == e)) {
var a = Qe[t];
!1 !== eve("anim.resume." + this.id, this, a.anim) && (delete a.paused, this.status(a.anim, a.status));
}
return this;
}, je.stop = function(e) {
for (var t = 0; t < Qe.length; t++) Qe[t].el.id != this.id || e && Qe[t].anim != e || !1 !== eve("anim.stop." + this.id, this, Qe[t].anim) && Qe.splice(t--, 1);
return this;
}, je.toString = function() {
return "Rapha\xebl\u2019s object";
};
var at, nt, it, rt = function(e) {
if (this.items = [], this.length = 0, this.type = "set", e) for (var t = 0, a = e.length; t < a; t++) !e[t] || e[t].constructor != je.constructor && e[t].constructor != rt || (this[this.items.length] = this.items[this.items.length] = e[t], 
this.length++);
}, st = rt.prototype;
for (var ot in st.push = function() {
for (var e, t, a = 0, n = arguments.length; a < n; a++) !(e = arguments[a]) || e.constructor != je.constructor && e.constructor != rt || (this[t = this.items.length] = this.items[t] = e, 
this.length++);
return this;
}, st.pop = function() {
return this.length && delete this[this.length--], this.items.pop();
}, st.forEach = function(e, t) {
for (var a = 0, n = this.items.length; a < n; a++) if (!1 === e.call(t, this.items[a], a)) return this;
return this;
}, je) je[E](ot) && (st[ot] = function(a) {
return function() {
var t = arguments;
return this.forEach(function(e) {
e[a][f](e, t);
});
};
}(ot));
st.attr = function(e, t) {
if (e && L.is(e, y) && L.is(e[0], "object")) for (var a = 0, n = e.length; a < n; a++) this.items[a].attr(e[a]); else for (var i = 0, r = this.items.length; i < r; i++) this.items[i].attr(e, t);
return this;
}, st.clear = function() {
for (;this.length; ) this.pop();
}, st.splice = function(e, t, a) {
e = e < 0 ? v(this.length + e, 0) : e, t = v(0, b(this.length - e, t));
var n, i = [], r = [], s = [];
for (n = 2; n < arguments.length; n++) s.push(arguments[n]);
for (n = 0; n < t; n++) r.push(this[e + n]);
for (;n < this.length - e; n++) i.push(this[e + n]);
var o = s.length;
for (n = 0; n < o + i.length; n++) this.items[e + n] = this[e + n] = n < o ? s[n] : i[n - o];
for (n = this.items.length = this.length -= t - o; this[n]; ) delete this[n++];
return new rt(r);
}, st.exclude = function(e) {
for (var t = 0, a = this.length; t < a; t++) if (this[t] == e) return this.splice(t, 1), 
!0;
}, st.animate = function(e, t, a, n) {
(L.is(a, "function") || !a) && (n = a || null);
var i, r, s = this.items.length, o = s, p = this;
if (!s) return this;
n && (r = function() {
!--s && n.call(p);
}), a = L.is(a, l) ? a : r;
var c = L.animation(e, t, a, r);
for (i = this.items[--o].animate(c); o--; ) this.items[o] && !this.items[o].removed && this.items[o].animateWith(i, c, c);
return this;
}, st.insertAfter = function(e) {
for (var t = this.items.length; t--; ) this.items[t].insertAfter(e);
return this;
}, st.getBBox = function() {
for (var e = [], t = [], a = [], n = [], i = this.items.length; i--; ) if (!this.items[i].removed) {
var r = this.items[i].getBBox();
e.push(r.x), t.push(r.y), a.push(r.x + r.width), n.push(r.y + r.height);
}
return {
x: e = b[f](0, e),
y: t = b[f](0, t),
width: v[f](0, a) - e,
height: v[f](0, n) - t
};
}, st.clone = function(e) {
e = new rt();
for (var t = 0, a = this.items.length; t < a; t++) e.push(this.items[t].clone());
return e;
}, st.toString = function() {
return "Rapha\xebl\u2018s set";
}, L.registerFont = function(e) {
if (!e.face) return e;
this.fonts = this.fonts || {};
var t = {
w: e.w,
face: {},
glyphs: {}
}, a = e.face["font-family"];
for (var n in e.face) e.face[E](n) && (t.face[n] = e.face[n]);
if (this.fonts[a] ? this.fonts[a].push(t) : this.fonts[a] = [ t ], !e.svg) for (var i in t.face["units-per-em"] = B(e.face["units-per-em"], 10), 
e.glyphs) if (e.glyphs[E](i)) {
var r = e.glyphs[i];
if (t.glyphs[i] = {
w: r.w,
k: {},
d: r.d && "M" + r.d.replace(/[mlcxtrv]/g, function(e) {
return {
l: "L",
c: "C",
x: "z",
t: "m",
r: "l",
v: "c"
}[e] || "M";
}) + "z"
}, r.k) for (var s in r.k) r[E](s) && (t.glyphs[i].k[s] = r.k[s]);
}
return e;
}, e.getFont = function(e, t, a, n) {
if (n = n || "normal", a = a || "normal", t = +t || {
normal: 400,
bold: 700,
lighter: 300,
bolder: 800
}[t] || 400, L.fonts) {
var i, r = L.fonts[e];
if (!r) {
var s = new RegExp("(^|\\s)" + e.replace(/[^\w\d\s+!~.:_-]/g, x) + "(\\s|$)", "i");
for (var o in L.fonts) if (L.fonts[E](o) && s.test(o)) {
r = L.fonts[o];
break;
}
}
if (r) for (var p = 0, c = r.length; p < c && ((i = r[p]).face["font-weight"] != t || i.face["font-style"] != a && i.face["font-style"] || i.face["font-stretch"] != n); p++) ;
return i;
}
}, e.print = function(e, t, a, n, i, r, s) {
r = r || "middle", s = v(b(s || 0, 1), -1);
var o, p = this.set(), c = H(a)[F](x), d = 0;
if (L.is(n, a) && (n = this.getFont(n)), n) {
o = (i || 16) / n.face["units-per-em"];
for (var l = n.face.bbox[F](V), u = +l[0], h = +l[1] + ("baseline" == r ? l[3] - l[1] + +n.face.descent : (l[3] - l[1]) / 2), m = 0, g = c.length; m < g; m++) {
var f = m && n.glyphs[c[m - 1]] || {}, _ = n.glyphs[c[m]];
d += m ? (f.w || n.w) + (f.k && f.k[c[m]] || 0) + n.w * s : 0, _ && _.d && p.push(this.path(_.d).attr({
fill: "#000",
stroke: "none",
transform: [ [ "t", d * o, 0 ] ]
}));
}
p.transform([ "...s", o, o, u, h, "t", (e - u) / o, (t - h) / o ]);
}
return p;
}, e.add = function(e) {
if (L.is(e, "array")) for (var t, a = this.set(), n = 0, i = e.length; n < i; n++) t = e[n] || {}, 
r[E](t.type) && a.push(this[t.type]().attr(t));
return a;
}, L.format = function(e, t) {
var a = L.is(t, y) ? [ 0 ][W](t) : arguments;
return e && L.is(e, l) && a.length - 1 && (e = e.replace(i, function(e, t) {
return null == a[++t] ? x : a[t];
})), e || x;
}, L.fullfill = (at = /\{([^\}]+)\}/g, nt = /(?:(?:^|\.)(.+?)(?=\[|\.|$|\()|\[('|")(.+?)\2\])(\(\))?/g, 
it = function(e, t, a) {
var r = a;
return t.replace(nt, function(e, t, a, n, i) {
t = t || n, r && (t in r && (r = r[t]), "function" == typeof r && i && (r = r()));
}), r = (null == r || r == a ? e : r) + "";
}, function(e, a) {
return String(e).replace(at, function(e, t) {
return it(e, t, a);
});
}), L.ninja = function() {
return t.was ? m.win.Raphael = t.is : delete Raphael, L;
}, L.st = st, function(e, t, a) {
function n() {
/in/.test(e.readyState) ? setTimeout(n, 9) : L.eve("DOMload");
}
null == e.readyState && e.addEventListener && (e.addEventListener(t, a = function() {
e.removeEventListener(t, a, !1), e.readyState = "complete";
}, !1), e.readyState = "loading"), n();
}(document, "DOMContentLoaded"), t.was ? m.win.Raphael = L : Raphael = L, eve.on("DOMload", function() {
n = !0;
});
}(), 
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
// │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
window.Raphael.svg && function(C) {
var G = "hasOwnProperty", S = String, f = parseFloat, b = parseInt, _ = Math, y = _.max, k = _.abs, A = _.pow, x = /[, ]+/, u = C.eve, T = "", d = " ", w = "http://www.w3.org/1999/xlink", B = {
block: "M5,0 0,2.5 5,5z",
classic: "M5,0 0,2.5 5,5 3.5,3 3.5,2z",
diamond: "M2.5,0 5,2.5 2.5,5 0,2.5z",
open: "M6,1 1,3.5 6,6",
oval: "M2.5,0A2.5,2.5,0,0,1,2.5,5 2.5,2.5,0,0,1,2.5,0z"
}, $ = {};
C.toString = function() {
return "Your browser supports SVG.\nYou are running Rapha\xebl " + this.version;
};
var I = function(e, t) {
if (t) for (var a in "string" == typeof e && (e = I(e)), t) t[G](a) && ("xlink:" == a.substring(0, 6) ? e.setAttributeNS(w, a.substring(6), S(t[a])) : e.setAttribute(a, S(t[a]))); else (e = C._g.doc.createElementNS("http://www.w3.org/2000/svg", e)).style && (e.style.webkitTapHighlightColor = "rgba(0,0,0,0)");
return e;
}, N = function(e, t) {
var i = "linear", a = e.id + t, r = .5, s = .5, n = e.node, o = e.paper, p = n.style, c = C._g.doc.getElementById(a);
if (!c) {
if (t = (t = S(t).replace(C._radial_gradient, function(e, t, a) {
if (i = "radial", t && a) {
r = f(t);
var n = 2 * (.5 < (s = f(a))) - 1;
.25 < A(r - .5, 2) + A(s - .5, 2) && (s = _.sqrt(.25 - A(r - .5, 2)) * n + .5) && .5 != s && (s = s.toFixed(5) - 1e-5 * n);
}
return T;
})).split(/\s*\-\s*/), "linear" == i) {
var d = t.shift();
if (d = -f(d), isNaN(d)) return null;
var l = [ 0, 0, _.cos(C.rad(d)), _.sin(C.rad(d)) ], u = 1 / (y(k(l[2]), k(l[3])) || 1);
l[2] *= u, l[3] *= u, l[2] < 0 && (l[0] = -l[2], l[2] = 0), l[3] < 0 && (l[1] = -l[3], 
l[3] = 0);
}
var h = C._parseDots(t);
if (!h) return null;
if (a = a.replace(/[\(\)\s,\xb0#]/g, "_"), e.gradient && a != e.gradient.id && (o.defs.removeChild(e.gradient), 
delete e.gradient), !e.gradient) {
c = I(i + "Gradient", {
id: a
}), e.gradient = c, I(c, "radial" == i ? {
fx: r,
fy: s
} : {
x1: l[0],
y1: l[1],
x2: l[2],
y2: l[3],
gradientTransform: e.matrix.invert()
}), o.defs.appendChild(c);
for (var m = 0, g = h.length; m < g; m++) c.appendChild(I("stop", {
offset: h[m].offset ? h[m].offset : m ? "100%" : "0%",
"stop-color": h[m].color || "#fff"
}));
}
}
return I(n, {
fill: "url(#" + a + ")",
opacity: 1,
"fill-opacity": 1
}), p.fill = T, p.opacity = 1, p.fillOpacity = 1;
}, P = function(e) {
var t = e.getBBox(1);
I(e.pattern, {
patternTransform: e.matrix.invert() + " translate(" + t.x + "," + t.y + ")"
});
}, L = function(e, t, a) {
if ("path" == e.type) {
for (var n, i, r, s, o, p = S(t).toLowerCase().split("-"), c = e.paper, d = a ? "end" : "start", l = e.node, u = e.attrs, h = u["stroke-width"], m = p.length, g = "classic", f = 3, _ = 3, A = 5; m--; ) switch (p[m]) {
case "block":
case "classic":
case "oval":
case "diamond":
case "open":
case "none":
g = p[m];
break;

case "wide":
_ = 5;
break;

case "narrow":
_ = 2;
break;

case "long":
f = 5;
break;

case "short":
f = 2;
}
if ("open" == g ? (f += 2, _ += 2, A += 2, r = 1, s = a ? 4 : 1, o = {
fill: "none",
stroke: u.stroke
}) : (s = r = f / 2, o = {
fill: u.stroke,
stroke: "none"
}), e._.arrows ? a ? (e._.arrows.endPath && $[e._.arrows.endPath]--, e._.arrows.endMarker && $[e._.arrows.endMarker]--) : (e._.arrows.startPath && $[e._.arrows.startPath]--, 
e._.arrows.startMarker && $[e._.arrows.startMarker]--) : e._.arrows = {}, "none" != g) {
var v = "raphael-marker-" + g, b = "raphael-marker-" + d + g + f + _;
C._g.doc.getElementById(v) ? $[v]++ : (c.defs.appendChild(I(I("path"), {
"stroke-linecap": "round",
d: B[g],
id: v
})), $[v] = 1);
var y, k = C._g.doc.getElementById(b);
k ? ($[b]++, y = k.getElementsByTagName("use")[0]) : (k = I(I("marker"), {
id: b,
markerHeight: _,
markerWidth: f,
orient: "auto",
refX: s,
refY: _ / 2
}), y = I(I("use"), {
"xlink:href": "#" + v,
transform: (a ? "rotate(180 " + f / 2 + " " + _ / 2 + ") " : T) + "scale(" + f / A + "," + _ / A + ")",
"stroke-width": (1 / ((f / A + _ / A) / 2)).toFixed(4)
}), k.appendChild(y), c.defs.appendChild(k), $[b] = 1), I(y, o);
var x = r * ("diamond" != g && "oval" != g);
a ? (n = e._.arrows.startdx * h || 0, i = C.getTotalLength(u.path) - x * h) : (n = x * h, 
i = C.getTotalLength(u.path) - (e._.arrows.enddx * h || 0)), (o = {})["marker-" + d] = "url(#" + b + ")", 
(i || n) && (o.d = Raphael.getSubpath(u.path, n, i)), I(l, o), e._.arrows[d + "Path"] = v, 
e._.arrows[d + "Marker"] = b, e._.arrows[d + "dx"] = x, e._.arrows[d + "Type"] = g, 
e._.arrows[d + "String"] = t;
} else a ? (n = e._.arrows.startdx * h || 0, i = C.getTotalLength(u.path) - n) : (n = 0, 
i = C.getTotalLength(u.path) - (e._.arrows.enddx * h || 0)), e._.arrows[d + "Path"] && I(l, {
d: Raphael.getSubpath(u.path, n, i)
}), delete e._.arrows[d + "Path"], delete e._.arrows[d + "Marker"], delete e._.arrows[d + "dx"], 
delete e._.arrows[d + "Type"], delete e._.arrows[d + "String"];
for (o in $) if ($[G](o) && !$[o]) {
var w = C._g.doc.getElementById(o);
w && w.parentNode.removeChild(w);
}
}
}, o = {
"": [ 0 ],
none: [ 0 ],
"-": [ 3, 1 ],
".": [ 1, 1 ],
"-.": [ 3, 1, 1, 1 ],
"-..": [ 3, 1, 1, 1, 1, 1 ],
". ": [ 1, 3 ],
"- ": [ 4, 3 ],
"--": [ 8, 3 ],
"- .": [ 4, 3, 1, 3 ],
"--.": [ 8, 3, 1, 3 ],
"--..": [ 8, 3, 1, 3, 1, 3 ]
}, M = function(e, t, a) {
if (t = o[S(t).toLowerCase()]) {
for (var n = e.attrs["stroke-width"] || "1", i = {
round: n,
square: n,
butt: 0
}[e.attrs["stroke-linecap"] || a["stroke-linecap"]] || 0, r = [], s = t.length; s--; ) r[s] = t[s] * n + (s % 2 ? 1 : -1) * i;
I(e.node, {
"stroke-dasharray": r.join(",")
});
}
}, h = function(n, e) {
var t = n.node, a = n.attrs, i = t.style.visibility;
for (var r in t.style.visibility = "hidden", e) if (e[G](r)) {
if (!C._availableAttrs[G](r)) continue;
var s = e[r];
switch (a[r] = s, r) {
case "blur":
n.blur(s);
break;

case "href":
case "title":
case "target":
var o = t.parentNode;
if ("a" != o.tagName.toLowerCase()) {
var p = I("a");
o.insertBefore(p, t), p.appendChild(t), o = p;
}
"target" == r ? o.setAttributeNS(w, "show", "blank" == s ? "new" : s) : o.setAttributeNS(w, r, s);
break;

case "cursor":
t.style.cursor = s;
break;

case "transform":
n.transform(s);
break;

case "arrow-start":
L(n, s);
break;

case "arrow-end":
L(n, s, 1);
break;

case "clip-rect":
var c = S(s).split(x);
if (4 == c.length) {
n.clip && n.clip.parentNode.parentNode.removeChild(n.clip.parentNode);
var d = I("clipPath"), l = I("rect");
d.id = C.createUUID(), I(l, {
x: c[0],
y: c[1],
width: c[2],
height: c[3]
}), d.appendChild(l), n.paper.defs.appendChild(d), I(t, {
"clip-path": "url(#" + d.id + ")"
}), n.clip = l;
}
if (!s) {
var u = t.getAttribute("clip-path");
if (u) {
var h = C._g.doc.getElementById(u.replace(/(^url\(#|\)$)/g, T));
h && h.parentNode.removeChild(h), I(t, {
"clip-path": T
}), delete n.clip;
}
}
break;

case "path":
"path" == n.type && (I(t, {
d: s ? a.path = C._pathToAbsolute(s) : "M0,0"
}), n._.dirty = 1, n._.arrows && ("startString" in n._.arrows && L(n, n._.arrows.startString), 
"endString" in n._.arrows && L(n, n._.arrows.endString, 1)));
break;

case "width":
if (t.setAttribute(r, s), n._.dirty = 1, !a.fx) break;
r = "x", s = a.x;

case "x":
a.fx && (s = -a.x - (a.width || 0));

case "rx":
if ("rx" == r && "rect" == n.type) break;

case "cx":
t.setAttribute(r, s), n.pattern && P(n), n._.dirty = 1;
break;

case "height":
if (t.setAttribute(r, s), n._.dirty = 1, !a.fy) break;
r = "y", s = a.y;

case "y":
a.fy && (s = -a.y - (a.height || 0));

case "ry":
if ("ry" == r && "rect" == n.type) break;

case "cy":
t.setAttribute(r, s), n.pattern && P(n), n._.dirty = 1;
break;

case "r":
"rect" == n.type ? I(t, {
rx: s,
ry: s
}) : t.setAttribute(r, s), n._.dirty = 1;
break;

case "src":
"image" == n.type && t.setAttributeNS(w, "href", s);
break;

case "stroke-width":
1 == n._.sx && 1 == n._.sy || (s /= y(k(n._.sx), k(n._.sy)) || 1), n.paper._vbSize && (s *= n.paper._vbSize), 
t.setAttribute(r, s), a["stroke-dasharray"] && M(n, a["stroke-dasharray"], e), n._.arrows && ("startString" in n._.arrows && L(n, n._.arrows.startString), 
"endString" in n._.arrows && L(n, n._.arrows.endString, 1));
break;

case "stroke-dasharray":
M(n, s, e);
break;

case "fill":
var m = S(s).match(C._ISURL);
if (m) {
d = I("pattern");
var g = I("image");
d.id = C.createUUID(), I(d, {
x: 0,
y: 0,
patternUnits: "userSpaceOnUse",
height: 1,
width: 1
}), I(g, {
x: 0,
y: 0,
"xlink:href": m[1]
}), d.appendChild(g), function(a) {
C._preload(m[1], function() {
var e = this.offsetWidth, t = this.offsetHeight;
I(a, {
width: e,
height: t
}), I(g, {
width: e,
height: t
}), n.paper.safari();
});
}(d), n.paper.defs.appendChild(d), I(t, {
fill: "url(#" + d.id + ")"
}), n.pattern = d, n.pattern && P(n);
break;
}
var f = C.getRGB(s);
if (f.error) {
if (("circle" == n.type || "ellipse" == n.type || "r" != S(s).charAt()) && N(n, s)) {
if ("opacity" in a || "fill-opacity" in a) {
var _ = C._g.doc.getElementById(t.getAttribute("fill").replace(/^url\(#|\)$/g, T));
if (_) {
var A = _.getElementsByTagName("stop");
I(A[A.length - 1], {
"stop-opacity": ("opacity" in a ? a.opacity : 1) * ("fill-opacity" in a ? a["fill-opacity"] : 1)
});
}
}
a.gradient = s, a.fill = "none";
break;
}
} else delete e.gradient, delete a.gradient, !C.is(a.opacity, "undefined") && C.is(e.opacity, "undefined") && I(t, {
opacity: a.opacity
}), !C.is(a["fill-opacity"], "undefined") && C.is(e["fill-opacity"], "undefined") && I(t, {
"fill-opacity": a["fill-opacity"]
});
f[G]("opacity") && I(t, {
"fill-opacity": 1 < f.opacity ? f.opacity / 100 : f.opacity
});

case "stroke":
f = C.getRGB(s), t.setAttribute(r, f.hex), "stroke" == r && f[G]("opacity") && I(t, {
"stroke-opacity": 1 < f.opacity ? f.opacity / 100 : f.opacity
}), "stroke" == r && n._.arrows && ("startString" in n._.arrows && L(n, n._.arrows.startString), 
"endString" in n._.arrows && L(n, n._.arrows.endString, 1));
break;

case "gradient":
("circle" == n.type || "ellipse" == n.type || "r" != S(s).charAt()) && N(n, s);
break;

case "opacity":
a.gradient && !a[G]("stroke-opacity") && I(t, {
"stroke-opacity": 1 < s ? s / 100 : s
});

case "fill-opacity":
if (a.gradient) {
(_ = C._g.doc.getElementById(t.getAttribute("fill").replace(/^url\(#|\)$/g, T))) && (A = _.getElementsByTagName("stop"), 
I(A[A.length - 1], {
"stop-opacity": s
}));
break;
}

default:
"font-size" == r && (s = b(s, 10) + "px");
var v = r.replace(/(\-.)/g, function(e) {
return e.substring(1).toUpperCase();
});
t.style[v] = s, n._.dirty = 1, t.setAttribute(r, s);
}
}
D(n, e), t.style.visibility = i;
}, m = 1.2, D = function(e, t) {
if ("text" == e.type && (t[G]("text") || t[G]("font") || t[G]("font-size") || t[G]("x") || t[G]("y"))) {
var a = e.attrs, n = e.node, i = n.firstChild ? b(C._g.doc.defaultView.getComputedStyle(n.firstChild, T).getPropertyValue("font-size"), 10) : 10;
if (t[G]("text")) {
for (a.text = t.text; n.firstChild; ) n.removeChild(n.firstChild);
for (var r, s = S(t.text).split("\n"), o = [], p = 0, c = s.length; p < c; p++) r = I("tspan"), 
p && I(r, {
dy: i * m,
x: a.x
}), r.appendChild(C._g.doc.createTextNode(s[p])), n.appendChild(r), o[p] = r;
} else for (p = 0, c = (o = n.getElementsByTagName("tspan")).length; p < c; p++) p ? I(o[p], {
dy: i * m,
x: a.x
}) : I(o[0], {
dy: 0
});
I(n, {
x: a.x,
y: a.y
}), e._.dirty = 1;
var d = e._getBBox(), l = a.y - (d.y + d.height / 2);
l && C.is(l, "finite") && I(o[0], {
dy: l
});
}
}, p = function(e, t) {
this[0] = this.node = e, e.raphael = !0, this.id = C._oid++, e.raphaelid = this.id, 
this.matrix = C.matrix(), this.realPath = null, this.paper = t, this.attrs = this.attrs || {}, 
this._ = {
transform: [],
sx: 1,
sy: 1,
deg: 0,
dx: 0,
dy: 0,
dirty: 1
}, !t.bottom && (t.bottom = this), this.prev = t.top, t.top && (t.top.next = this), 
(t.top = this).next = null;
}, e = C.el;
(p.prototype = e).constructor = p, C._engine.path = function(e, t) {
var a = I("path");
t.canvas && t.canvas.appendChild(a);
var n = new p(a, t);
return n.type = "path", h(n, {
fill: "none",
stroke: "#000",
path: e
}), n;
}, e.rotate = function(e, t, a) {
if (this.removed) return this;
if ((e = S(e).split(x)).length - 1 && (t = f(e[1]), a = f(e[2])), e = f(e[0]), null == a && (t = a), 
null == t || null == a) {
var n = this.getBBox(1);
t = n.x + n.width / 2, a = n.y + n.height / 2;
}
return this.transform(this._.transform.concat([ [ "r", e, t, a ] ])), this;
}, e.scale = function(e, t, a, n) {
if (this.removed) return this;
if ((e = S(e).split(x)).length - 1 && (t = f(e[1]), a = f(e[2]), n = f(e[3])), e = f(e[0]), 
null == t && (t = e), null == n && (a = n), null == a || null == n) var i = this.getBBox(1);
return a = null == a ? i.x + i.width / 2 : a, n = null == n ? i.y + i.height / 2 : n, 
this.transform(this._.transform.concat([ [ "s", e, t, a, n ] ])), this;
}, e.translate = function(e, t) {
return this.removed || ((e = S(e).split(x)).length - 1 && (t = f(e[1])), e = f(e[0]) || 0, 
t = +t || 0, this.transform(this._.transform.concat([ [ "t", e, t ] ]))), this;
}, e.transform = function(e) {
var t = this._;
if (null == e) return t.transform;
if (C._extractTransform(this, e), this.clip && I(this.clip, {
transform: this.matrix.invert()
}), this.pattern && P(this), this.node && I(this.node, {
transform: this.matrix
}), 1 != t.sx || 1 != t.sy) {
var a = this.attrs[G]("stroke-width") ? this.attrs["stroke-width"] : 1;
this.attr({
"stroke-width": a
});
}
return this;
}, e.hide = function() {
return !this.removed && this.paper.safari(this.node.style.display = "none"), this;
}, e.show = function() {
return !this.removed && this.paper.safari(this.node.style.display = ""), this;
}, e.remove = function() {
if (!this.removed) {
var e = this.paper;
for (var t in e.__set__ && e.__set__.exclude(this), u.unbind("*.*." + this.id), 
this.gradient && e.defs.removeChild(this.gradient), C._tear(this, e), "a" == this.node.parentNode.tagName.toLowerCase() ? this.node.parentNode.parentNode.removeChild(this.node.parentNode) : this.node.parentNode.removeChild(this.node), 
this) this[t] = "function" == typeof this[t] ? C._removedFactory(t) : null;
this.removed = !0;
}
}, e._getBBox = function() {
if ("none" == this.node.style.display) {
this.show();
var e = !0;
}
var t = {};
try {
t = this.node.getBBox();
} catch (a) {} finally {
t = t || {};
}
return e && this.hide(), t;
}, e.attr = function(e, t) {
if (this.removed) return this;
if (null == e) {
var a = {};
for (var n in this.attrs) this.attrs[G](n) && (a[n] = this.attrs[n]);
return a.gradient && "none" == a.fill && (a.fill = a.gradient) && delete a.gradient, 
a.transform = this._.transform, a;
}
if (null == t && C.is(e, "string")) {
if ("fill" == e && "none" == this.attrs.fill && this.attrs.gradient) return this.attrs.gradient;
if ("transform" == e) return this._.transform;
for (var i = e.split(x), r = {}, s = 0, o = i.length; s < o; s++) (e = i[s]) in this.attrs ? r[e] = this.attrs[e] : C.is(this.paper.customAttributes[e], "function") ? r[e] = this.paper.customAttributes[e].def : r[e] = C._availableAttrs[e];
return o - 1 ? r : r[i[0]];
}
if (null == t && C.is(e, "array")) {
for (r = {}, s = 0, o = e.length; s < o; s++) r[e[s]] = this.attr(e[s]);
return r;
}
if (null != t) {
var p = {};
p[e] = t;
} else null != e && C.is(e, "object") && (p = e);
for (var c in p) u("attr." + c + "." + this.id, this, p[c]);
for (c in this.paper.customAttributes) if (this.paper.customAttributes[G](c) && p[G](c) && C.is(this.paper.customAttributes[c], "function")) {
var d = this.paper.customAttributes[c].apply(this, [].concat(p[c]));
for (var l in this.attrs[c] = p[c], d) d[G](l) && (p[l] = d[l]);
}
return h(this, p), this;
}, e.toFront = function() {
if (this.removed) return this;
"a" == this.node.parentNode.tagName.toLowerCase() ? this.node.parentNode.parentNode.appendChild(this.node.parentNode) : this.node.parentNode.appendChild(this.node);
var e = this.paper;
return e.top != this && C._tofront(this, e), this;
}, e.toBack = function() {
if (this.removed) return this;
var e = this.node.parentNode;
"a" == e.tagName.toLowerCase() ? e.parentNode.insertBefore(this.node.parentNode, this.node.parentNode.parentNode.firstChild) : e.firstChild != this.node && e.insertBefore(this.node, this.node.parentNode.firstChild), 
C._toback(this, this.paper);
this.paper;
return this;
}, e.insertAfter = function(e) {
if (this.removed) return this;
var t = e.node || e[e.length - 1].node;
return t.nextSibling ? t.parentNode.insertBefore(this.node, t.nextSibling) : t.parentNode.appendChild(this.node), 
C._insertafter(this, e, this.paper), this;
}, e.insertBefore = function(e) {
if (this.removed) return this;
var t = e.node || e[0].node;
return t.parentNode.insertBefore(this.node, t), C._insertbefore(this, e, this.paper), 
this;
}, e.blur = function(e) {
var t = this;
if (0 != +e) {
var a = I("filter"), n = I("feGaussianBlur");
t.attrs.blur = e, a.id = C.createUUID(), I(n, {
stdDeviation: +e || 1.5
}), a.appendChild(n), t.paper.defs.appendChild(a), t._blur = a, I(t.node, {
filter: "url(#" + a.id + ")"
});
} else t._blur && (t._blur.parentNode.removeChild(t._blur), delete t._blur, delete t.attrs.blur), 
t.node.removeAttribute("filter");
}, C._engine.circle = function(e, t, a, n) {
var i = I("circle");
e.canvas && e.canvas.appendChild(i);
var r = new p(i, e);
return r.attrs = {
cx: t,
cy: a,
r: n,
fill: "none",
stroke: "#000"
}, r.type = "circle", I(i, r.attrs), r;
}, C._engine.rect = function(e, t, a, n, i, r) {
var s = I("rect");
e.canvas && e.canvas.appendChild(s);
var o = new p(s, e);
return o.attrs = {
x: t,
y: a,
width: n,
height: i,
r: r || 0,
rx: r || 0,
ry: r || 0,
fill: "none",
stroke: "#000"
}, o.type = "rect", I(s, o.attrs), o;
}, C._engine.ellipse = function(e, t, a, n, i) {
var r = I("ellipse");
e.canvas && e.canvas.appendChild(r);
var s = new p(r, e);
return s.attrs = {
cx: t,
cy: a,
rx: n,
ry: i,
fill: "none",
stroke: "#000"
}, s.type = "ellipse", I(r, s.attrs), s;
}, C._engine.image = function(e, t, a, n, i, r) {
var s = I("image");
I(s, {
x: a,
y: n,
width: i,
height: r,
preserveAspectRatio: "none"
}), s.setAttributeNS(w, "href", t), e.canvas && e.canvas.appendChild(s);
var o = new p(s, e);
return o.attrs = {
x: a,
y: n,
width: i,
height: r,
src: t
}, o.type = "image", o;
}, C._engine.text = function(e, t, a, n) {
var i = I("text");
e.canvas && e.canvas.appendChild(i);
var r = new p(i, e);
return r.attrs = {
x: t,
y: a,
"text-anchor": "middle",
text: n,
font: C._availableAttrs.font,
stroke: "none",
fill: "#000"
}, r.type = "text", h(r, r.attrs), r;
}, C._engine.setSize = function(e, t) {
return this.width = e || this.width, this.height = t || this.height, this.canvas.setAttribute("width", this.width), 
this.canvas.setAttribute("height", this.height), this._viewBox && this.setViewBox.apply(this, this._viewBox), 
this;
}, C._engine.create = function() {
var e = C._getContainer.apply(0, arguments), t = e && e.container, a = e.x, n = e.y, i = e.width, r = e.height;
if (!t) throw new Error("SVG container not found.");
var s, o = I("svg"), p = "overflow:hidden;";
return a = a || 0, n = n || 0, I(o, {
height: r = r || 342,
version: 1.1,
width: i = i || 512,
xmlns: "http://www.w3.org/2000/svg"
}), 1 == t ? (o.style.cssText = p + "position:absolute;left:" + a + "px;top:" + n + "px", 
C._g.doc.body.appendChild(o), s = 1) : (o.style.cssText = p + "position:relative", 
t.firstChild ? t.insertBefore(o, t.firstChild) : t.appendChild(o)), (t = new C._Paper()).width = i, 
t.height = r, t.canvas = o, t.clear(), t._left = t._top = 0, s && (t.renderfix = function() {}), 
t.renderfix(), t;
}, C._engine.setViewBox = function(e, t, a, n, i) {
u("setViewBox", this, this._viewBox, [ e, t, a, n, i ]);
var r, s, o = y(a / this.width, n / this.height), p = this.top, c = i ? "meet" : "xMinYMin";
for (null == e ? (this._vbSize && (o = 1), delete this._vbSize, r = "0 0 " + this.width + d + this.height) : (this._vbSize = o, 
r = e + d + t + d + a + d + n), I(this.canvas, {
viewBox: r,
preserveAspectRatio: c
}); o && p; ) s = "stroke-width" in p.attrs ? p.attrs["stroke-width"] : 1, p.attr({
"stroke-width": s
}), p._.dirty = 1, p._.dirtyT = 1, p = p.prev;
return this._viewBox = [ e, t, a, n, !!i ], this;
}, C.prototype.renderfix = function() {
var e, t = this.canvas, a = t.style;
try {
e = t.getScreenCTM() || t.createSVGMatrix();
} catch (r) {
e = t.createSVGMatrix();
}
var n = -e.e % 1, i = -e.f % 1;
(n || i) && (n && (this._left = (this._left + n) % 1, a.left = this._left + "px"), 
i && (this._top = (this._top + i) % 1, a.top = this._top + "px"));
}, C.prototype.clear = function() {
C.eve("clear", this);
for (var e = this.canvas; e.firstChild; ) e.removeChild(e.firstChild);
this.bottom = this.top = null, (this.desc = I("desc")).appendChild(C._g.doc.createTextNode("Created with Rapha\xebl " + C.version)), 
e.appendChild(this.desc), e.appendChild(this.defs = I("defs"));
}, C.prototype.remove = function() {
for (var e in u("remove", this), this.canvas.parentNode && this.canvas.parentNode.removeChild(this.canvas), 
this) this[e] = "function" == typeof this[e] ? C._removedFactory(e) : null;
};
var t = C.st;
for (var a in e) e[G](a) && !t[G](a) && (t[a] = function(a) {
return function() {
var t = arguments;
return this.forEach(function(e) {
e[a].apply(e, t);
});
};
}(a));
}(window.Raphael), 
// │ Copyright (c) 2008-2011 Dmitry Baranovskiy (http://raphaeljs.com)   │ \\
// │ Copyright (c) 2008-2011 Sencha Labs (http://sencha.com)             │ \\
window.Raphael.vml && function(P) {
var L = "hasOwnProperty", M = String, D = parseFloat, l = Math, V = l.round, E = l.max, H = l.min, _ = l.abs, O = "fill", j = /[, ]+/, u = P.eve, n = " progid:DXImageTransform.Microsoft", R = " ", z = "", h = {
M: "m",
L: "l",
C: "c",
Z: "x",
m: "t",
l: "r",
c: "v",
z: "x"
}, m = /([clmz]),?([^clmz]*)/gi, i = / progid:\S+Blur\([^\)]+\)/g, g = /-?[^,\s-]+/g, d = "position:absolute;left:0;top:0;width:1px;height:1px", W = 21600, F = {
path: 1,
rect: 1,
image: 1
}, q = {
circle: 1,
ellipse: 1
}, J = function(e) {
var t = /[ahqstv]/gi, a = P._pathToAbsolute;
if (M(e).match(t) && (a = P._path2curve), t = /[clmz]/g, a == P._pathToAbsolute && !M(e).match(t)) {
var n = M(e).replace(m, function(e, t, a) {
var n = [], i = "m" == t.toLowerCase(), r = h[t];
return a.replace(g, function(e) {
i && 2 == n.length && (r += n + h["m" == t ? "l" : "L"], n = []), n.push(V(e * W));
}), r + n;
});
return n;
}
var i, r, s = a(e);
n = [];
for (var o = 0, p = s.length; o < p; o++) {
i = s[o], "z" == (r = s[o][0].toLowerCase()) && (r = "x");
for (var c = 1, d = i.length; c < d; c++) r += V(i[c] * W) + (c != d - 1 ? "," : z);
n.push(r);
}
return n.join(R);
}, A = function(e, t, a) {
var n = P.matrix();
return n.rotate(-e, .5, .5), {
dx: n.x(t, a),
dy: n.y(t, a)
};
}, U = function(e, t, a, n, i, r) {
var s = e._, o = e.matrix, p = s.fillpos, c = e.node, d = c.style, l = 1, u = "", h = W / t, m = W / a;
if (d.visibility = "hidden", t && a) {
if (c.coordsize = _(h) + R + _(m), d.rotation = r * (t * a < 0 ? -1 : 1), r) {
var g = A(r, n, i);
n = g.dx, i = g.dy;
}
if (t < 0 && (u += "x"), a < 0 && (u += " y") && (l = -1), d.flip = u, c.coordorigin = n * -h + R + i * -m, 
p || s.fillsize) {
var f = c.getElementsByTagName(O);
f = f && f[0], c.removeChild(f), p && (g = A(r, o.x(p[0], p[1]), o.y(p[0], p[1])), 
f.position = g.dx * l + R + g.dy * l), s.fillsize && (f.size = s.fillsize[0] * _(t) + R + s.fillsize[1] * _(a)), 
c.appendChild(f);
}
d.visibility = "visible";
}
};
P.toString = function() {
return "Your browser doesn\u2019t support SVG. Falling down to VML.\nYou are running Rapha\xebl " + this.version;
};
var K, Y = function(e, t, a) {
for (var n = M(t).toLowerCase().split("-"), i = a ? "end" : "start", r = n.length, s = "classic", o = "medium", p = "medium"; r--; ) switch (n[r]) {
case "block":
case "classic":
case "oval":
case "diamond":
case "open":
case "none":
s = n[r];
break;

case "wide":
case "narrow":
p = n[r];
break;

case "long":
case "short":
o = n[r];
}
var c = e.node.getElementsByTagName("stroke")[0];
c[i + "arrow"] = s, c[i + "arrowlength"] = o, c[i + "arrowwidth"] = p;
}, f = function(e, t) {
e.attrs = e.attrs || {};
var a = e.node, n = e.attrs, i = a.style, r = F[e.type] && (t.x != n.x || t.y != n.y || t.width != n.width || t.height != n.height || t.cx != n.cx || t.cy != n.cy || t.rx != n.rx || t.ry != n.ry || t.r != n.r), s = q[e.type] && (n.cx != t.cx || n.cy != t.cy || n.r != t.r || n.rx != t.rx || n.ry != t.ry), o = e;
for (var p in t) t[L](p) && (n[p] = t[p]);
if (r && (n.path = P._getPath[e.type](e), e._.dirty = 1), t.href && (a.href = t.href), 
t.title && (a.title = t.title), t.target && (a.target = t.target), t.cursor && (i.cursor = t.cursor), 
"blur" in t && e.blur(t.blur), (t.path && "path" == e.type || r) && (a.path = J(~M(n.path).toLowerCase().indexOf("r") ? P._pathToAbsolute(n.path) : n.path), 
"image" == e.type && (e._.fillpos = [ n.x, n.y ], e._.fillsize = [ n.width, n.height ], 
U(e, 1, 1, 0, 0, 0))), "transform" in t && e.transform(t.transform), s) {
var c = +n.cx, d = +n.cy, l = +n.rx || +n.r || 0, u = +n.ry || +n.r || 0;
a.path = P.format("ar{0},{1},{2},{3},{4},{1},{4},{1}x", V((c - l) * W), V((d - u) * W), V((c + l) * W), V((d + u) * W), V(c * W));
}
if ("clip-rect" in t) {
var h = M(t["clip-rect"]).split(j);
if (4 == h.length) {
h[2] = +h[2] + +h[0], h[3] = +h[3] + +h[1];
var m = a.clipRect || P._g.doc.createElement("div"), g = m.style;
g.clip = P.format("rect({1}px {2}px {3}px {0}px)", h), a.clipRect || (g.position = "absolute", 
g.top = 0, g.left = 0, g.width = e.paper.width + "px", g.height = e.paper.height + "px", 
a.parentNode.insertBefore(m, a), m.appendChild(a), a.clipRect = m);
}
t["clip-rect"] || a.clipRect && (a.clipRect.style.clip = "auto");
}
if (e.textpath) {
var f = e.textpath.style;
t.font && (f.font = t.font), t["font-family"] && (f.fontFamily = '"' + t["font-family"].split(",")[0].replace(/^['"]+|['"]+$/g, z) + '"'), 
t["font-size"] && (f.fontSize = t["font-size"]), t["font-weight"] && (f.fontWeight = t["font-weight"]), 
t["font-style"] && (f.fontStyle = t["font-style"]);
}
if ("arrow-start" in t && Y(o, t["arrow-start"]), "arrow-end" in t && Y(o, t["arrow-end"], 1), 
null != t.opacity || null != t["stroke-width"] || null != t.fill || null != t.src || null != t.stroke || null != t["stroke-width"] || null != t["stroke-opacity"] || null != t["fill-opacity"] || null != t["stroke-dasharray"] || null != t["stroke-miterlimit"] || null != t["stroke-linejoin"] || null != t["stroke-linecap"]) {
var _ = a.getElementsByTagName(O);
if (!(_ = _ && _[0]) && (_ = K(O)), "image" == e.type && t.src && (_.src = t.src), 
t.fill && (_.on = !0), null != _.on && "none" != t.fill && null !== t.fill || (_.on = !1), 
_.on && t.fill) {
var A = M(t.fill).match(P._ISURL);
if (A) {
_.parentNode == a && a.removeChild(_), _.rotate = !0, _.src = A[1], _.type = "tile";
var v = e.getBBox(1);
_.position = v.x + R + v.y, e._.fillpos = [ v.x, v.y ], P._preload(A[1], function() {
e._.fillsize = [ this.offsetWidth, this.offsetHeight ];
});
} else _.color = P.getRGB(t.fill).hex, _.src = z, _.type = "solid", P.getRGB(t.fill).error && (o.type in {
circle: 1,
ellipse: 1
} || "r" != M(t.fill).charAt()) && X(o, t.fill, _) && (n.fill = "none", n.gradient = t.fill, 
_.rotate = !1);
}
if ("fill-opacity" in t || "opacity" in t) {
var b = ((+n["fill-opacity"] + 1 || 2) - 1) * ((+n.opacity + 1 || 2) - 1) * ((+P.getRGB(t.fill).o + 1 || 2) - 1);
b = H(E(b, 0), 1), _.opacity = b, _.src && (_.color = "none");
}
a.appendChild(_);
var y = a.getElementsByTagName("stroke") && a.getElementsByTagName("stroke")[0], k = !1;
!y && (k = y = K("stroke")), (t.stroke && "none" != t.stroke || t["stroke-width"] || null != t["stroke-opacity"] || t["stroke-dasharray"] || t["stroke-miterlimit"] || t["stroke-linejoin"] || t["stroke-linecap"]) && (y.on = !0), 
("none" == t.stroke || null === t.stroke || null == y.on || 0 == t.stroke || 0 == t["stroke-width"]) && (y.on = !1);
var x = P.getRGB(t.stroke);
y.on && t.stroke && (y.color = x.hex), b = ((+n["stroke-opacity"] + 1 || 2) - 1) * ((+n.opacity + 1 || 2) - 1) * ((+x.o + 1 || 2) - 1);
var w = .75 * (D(t["stroke-width"]) || 1);
if (b = H(E(b, 0), 1), null == t["stroke-width"] && (w = n["stroke-width"]), t["stroke-width"] && (y.weight = w), 
w && w < 1 && (b *= w) && (y.weight = 1), y.opacity = b, t["stroke-linejoin"] && (y.joinstyle = t["stroke-linejoin"] || "miter"), 
y.miterlimit = t["stroke-miterlimit"] || 8, t["stroke-linecap"] && (y.endcap = "butt" == t["stroke-linecap"] ? "flat" : "square" == t["stroke-linecap"] ? "square" : "round"), 
t["stroke-dasharray"]) {
var C = {
"-": "shortdash",
".": "shortdot",
"-.": "shortdashdot",
"-..": "shortdashdotdot",
". ": "dot",
"- ": "dash",
"--": "longdash",
"- .": "dashdot",
"--.": "longdashdot",
"--..": "longdashdotdot"
};
y.dashstyle = C[L](t["stroke-dasharray"]) ? C[t["stroke-dasharray"]] : z;
}
k && a.appendChild(y);
}
if ("text" == o.type) {
o.paper.canvas.style.display = z;
var G = o.paper.span, S = 100, T = n.font && n.font.match(/\d+(?:\.\d*)?(?=px)/);
i = G.style, n.font && (i.font = n.font), n["font-family"] && (i.fontFamily = n["font-family"]), 
n["font-weight"] && (i.fontWeight = n["font-weight"]), n["font-style"] && (i.fontStyle = n["font-style"]), 
T = D(n["font-size"] || T && T[0]) || 10, i.fontSize = T * S + "px", o.textpath.string && (G.innerHTML = M(o.textpath.string).replace(/</g, "&#60;").replace(/&/g, "&#38;").replace(/\n/g, "<br>"));
var B = G.getBoundingClientRect();
o.W = n.w = (B.right - B.left) / S, o.H = n.h = (B.bottom - B.top) / S, o.X = n.x, 
o.Y = n.y + o.H / 2, ("x" in t || "y" in t) && (o.path.v = P.format("m{0},{1}l{2},{1}", V(n.x * W), V(n.y * W), V(n.x * W) + 1));
for (var $ = [ "x", "y", "text", "font", "font-family", "font-weight", "font-style", "font-size" ], I = 0, N = $.length; I < N; I++) if ($[I] in t) {
o._.dirty = 1;
break;
}
switch (n["text-anchor"]) {
case "start":
o.textpath.style["v-text-align"] = "left", o.bbx = o.W / 2;
break;

case "end":
o.textpath.style["v-text-align"] = "right", o.bbx = -o.W / 2;
break;

default:
o.textpath.style["v-text-align"] = "center", o.bbx = 0;
}
o.textpath.style["v-text-kern"] = !0;
}
}, X = function(e, t, a) {
e.attrs = e.attrs || {};
e.attrs;
var n = Math.pow, i = "linear", r = ".5 .5";
if (e.attrs.gradient = t, t = (t = M(t).replace(P._radial_gradient, function(e, t, a) {
return i = "radial", t && a && (t = D(t), a = D(a), .25 < n(t - .5, 2) + n(a - .5, 2) && (a = l.sqrt(.25 - n(t - .5, 2)) * (2 * (.5 < a) - 1) + .5), 
r = t + R + a), z;
})).split(/\s*\-\s*/), "linear" == i) {
var s = t.shift();
if (s = -D(s), isNaN(s)) return null;
}
var o = P._parseDots(t);
if (!o) return null;
if (e = e.shape || e.node, o.length) {
e.removeChild(a), a.on = !0, a.method = "none", a.color = o[0].color, a.color2 = o[o.length - 1].color;
for (var p = [], c = 0, d = o.length; c < d; c++) o[c].offset && p.push(o[c].offset + R + o[c].color);
a.colors = p.length ? p.join() : "0% " + a.color, "radial" == i ? (a.type = "gradientTitle", 
a.focus = "100%", a.focussize = "0 0", a.focusposition = r, a.angle = 0) : (a.type = "gradient", 
a.angle = (270 - s) % 360), e.appendChild(a);
}
return 1;
}, v = function(e, t) {
this[0] = this.node = e, e.raphael = !0, this.id = P._oid++, e.raphaelid = this.id, 
this.X = 0, this.Y = 0, this.attrs = {}, this.paper = t, this.matrix = P.matrix(), 
this._ = {
transform: [],
sx: 1,
sy: 1,
dx: 0,
dy: 0,
deg: 0,
dirty: 1,
dirtyT: 1
}, !t.bottom && (t.bottom = this), this.prev = t.top, t.top && (t.top.next = this), 
(t.top = this).next = null;
}, e = P.el;
(v.prototype = e).constructor = v, e.transform = function(e) {
if (null == e) return this._.transform;
var t, a = this.paper._viewBoxShift, n = a ? "s" + [ a.scale, a.scale ] + "-1-1t" + [ a.dx, a.dy ] : z;
a && (t = e = M(e).replace(/\.{3}|\u2026/g, this._.transform || z)), P._extractTransform(this, n + e);
var i, r = this.matrix.clone(), s = this.skew, o = this.node, p = ~M(this.attrs.fill).indexOf("-"), c = !M(this.attrs.fill).indexOf("url(");
if (r.translate(-.5, -.5), c || p || "image" == this.type) if (s.matrix = "1 0 0 1", 
s.offset = "0 0", i = r.split(), p && i.noRotation || !i.isSimple) {
o.style.filter = r.toFilter();
var d = this.getBBox(), l = this.getBBox(1), u = d.x - l.x, h = d.y - l.y;
o.coordorigin = u * -W + R + h * -W, U(this, 1, 1, u, h, 0);
} else o.style.filter = z, U(this, i.scalex, i.scaley, i.dx, i.dy, i.rotate); else o.style.filter = z, 
s.matrix = M(r), s.offset = r.offset();
return t && (this._.transform = t), this;
}, e.rotate = function(e, t, a) {
if (this.removed) return this;
if (null != e) {
if ((e = M(e).split(j)).length - 1 && (t = D(e[1]), a = D(e[2])), e = D(e[0]), null == a && (t = a), 
null == t || null == a) {
var n = this.getBBox(1);
t = n.x + n.width / 2, a = n.y + n.height / 2;
}
return this._.dirtyT = 1, this.transform(this._.transform.concat([ [ "r", e, t, a ] ])), 
this;
}
}, e.translate = function(e, t) {
return this.removed || ((e = M(e).split(j)).length - 1 && (t = D(e[1])), e = D(e[0]) || 0, 
t = +t || 0, this._.bbox && (this._.bbox.x += e, this._.bbox.y += t), this.transform(this._.transform.concat([ [ "t", e, t ] ]))), 
this;
}, e.scale = function(e, t, a, n) {
if (this.removed) return this;
if ((e = M(e).split(j)).length - 1 && (t = D(e[1]), a = D(e[2]), n = D(e[3]), isNaN(a) && (a = null), 
isNaN(n) && (n = null)), e = D(e[0]), null == t && (t = e), null == n && (a = n), 
null == a || null == n) var i = this.getBBox(1);
return a = null == a ? i.x + i.width / 2 : a, n = null == n ? i.y + i.height / 2 : n, 
this.transform(this._.transform.concat([ [ "s", e, t, a, n ] ])), this._.dirtyT = 1, 
this;
}, e.hide = function() {
return !this.removed && (this.node.style.display = "none"), this;
}, e.show = function() {
return !this.removed && (this.node.style.display = z), this;
}, e._getBBox = function() {
return this.removed ? {} : {
x: this.X + (this.bbx || 0) - this.W / 2,
y: this.Y - this.H,
width: this.W,
height: this.H
};
}, e.remove = function() {
if (!this.removed) {
for (var e in this.paper.__set__ && this.paper.__set__.exclude(this), P.eve.unbind("*.*." + this.id), 
P._tear(this, this.paper), this.node.parentNode.removeChild(this.node), this.shape && this.shape.parentNode.removeChild(this.shape), 
this) this[e] = "function" == typeof this[e] ? P._removedFactory(e) : null;
this.removed = !0;
}
}, e.attr = function(e, t) {
if (this.removed) return this;
if (null == e) {
var a = {};
for (var n in this.attrs) this.attrs[L](n) && (a[n] = this.attrs[n]);
return a.gradient && "none" == a.fill && (a.fill = a.gradient) && delete a.gradient, 
a.transform = this._.transform, a;
}
if (null == t && P.is(e, "string")) {
if (e == O && "none" == this.attrs.fill && this.attrs.gradient) return this.attrs.gradient;
for (var i = e.split(j), r = {}, s = 0, o = i.length; s < o; s++) (e = i[s]) in this.attrs ? r[e] = this.attrs[e] : P.is(this.paper.customAttributes[e], "function") ? r[e] = this.paper.customAttributes[e].def : r[e] = P._availableAttrs[e];
return o - 1 ? r : r[i[0]];
}
if (this.attrs && null == t && P.is(e, "array")) {
for (r = {}, s = 0, o = e.length; s < o; s++) r[e[s]] = this.attr(e[s]);
return r;
}
var p;
for (var c in null != t && ((p = {})[e] = t), null == t && P.is(e, "object") && (p = e), 
p) u("attr." + c + "." + this.id, this, p[c]);
if (p) {
for (c in this.paper.customAttributes) if (this.paper.customAttributes[L](c) && p[L](c) && P.is(this.paper.customAttributes[c], "function")) {
var d = this.paper.customAttributes[c].apply(this, [].concat(p[c]));
for (var l in this.attrs[c] = p[c], d) d[L](l) && (p[l] = d[l]);
}
p.text && "text" == this.type && (this.textpath.string = p.text), f(this, p);
}
return this;
}, e.toFront = function() {
return !this.removed && this.node.parentNode.appendChild(this.node), this.paper && this.paper.top != this && P._tofront(this, this.paper), 
this;
}, e.toBack = function() {
return this.removed || this.node.parentNode.firstChild != this.node && (this.node.parentNode.insertBefore(this.node, this.node.parentNode.firstChild), 
P._toback(this, this.paper)), this;
}, e.insertAfter = function(e) {
return this.removed || (e.constructor == P.st.constructor && (e = e[e.length - 1]), 
e.node.nextSibling ? e.node.parentNode.insertBefore(this.node, e.node.nextSibling) : e.node.parentNode.appendChild(this.node), 
P._insertafter(this, e, this.paper)), this;
}, e.insertBefore = function(e) {
return this.removed || (e.constructor == P.st.constructor && (e = e[0]), e.node.parentNode.insertBefore(this.node, e.node), 
P._insertbefore(this, e, this.paper)), this;
}, e.blur = function(e) {
var t = this.node.runtimeStyle, a = t.filter;
a = a.replace(i, z), 0 != +e ? (this.attrs.blur = e, t.filter = a + R + n + ".Blur(pixelradius=" + (+e || 1.5) + ")", 
t.margin = P.format("-{0}px 0 0 -{0}px", V(+e || 1.5))) : (t.filter = a, t.margin = 0, 
delete this.attrs.blur);
}, P._engine.path = function(e, t) {
var a = K("shape");
a.style.cssText = d, a.coordsize = W + R + W, a.coordorigin = t.coordorigin;
var n = new v(a, t), i = {
fill: "none",
stroke: "#000"
};
e && (i.path = e), n.type = "path", n.path = [], n.Path = z, f(n, i), t.canvas.appendChild(a);
var r = K("skew");
return r.on = !0, a.appendChild(r), n.skew = r, n.transform(z), n;
}, P._engine.rect = function(e, t, a, n, i, r) {
var s = P._rectPath(t, a, n, i, r), o = e.path(s), p = o.attrs;
return o.X = p.x = t, o.Y = p.y = a, o.W = p.width = n, o.H = p.height = i, p.r = r, 
p.path = s, o.type = "rect", o;
}, P._engine.ellipse = function(e, t, a, n, i) {
var r = e.path();
r.attrs;
return r.X = t - n, r.Y = a - i, r.W = 2 * n, r.H = 2 * i, r.type = "ellipse", f(r, {
cx: t,
cy: a,
rx: n,
ry: i
}), r;
}, P._engine.circle = function(e, t, a, n) {
var i = e.path();
i.attrs;
return i.X = t - n, i.Y = a - n, i.W = i.H = 2 * n, i.type = "circle", f(i, {
cx: t,
cy: a,
r: n
}), i;
}, P._engine.image = function(e, t, a, n, i, r) {
var s = P._rectPath(a, n, i, r), o = e.path(s).attr({
stroke: "none"
}), p = o.attrs, c = o.node, d = c.getElementsByTagName(O)[0];
return p.src = t, o.X = p.x = a, o.Y = p.y = n, o.W = p.width = i, o.H = p.height = r, 
p.path = s, o.type = "image", d.parentNode == c && c.removeChild(d), d.rotate = !0, 
d.src = t, d.type = "tile", o._.fillpos = [ a, n ], o._.fillsize = [ i, r ], c.appendChild(d), 
U(o, 1, 1, 0, 0, 0), o;
}, P._engine.text = function(e, t, a, n) {
var i = K("shape"), r = K("path"), s = K("textpath");
t = t || 0, a = a || 0, n = n || "", r.v = P.format("m{0},{1}l{2},{1}", V(t * W), V(a * W), V(t * W) + 1), 
r.textpathok = !0, s.string = M(n), s.on = !0, i.style.cssText = d, i.coordsize = W + R + W, 
i.coordorigin = "0 0";
var o = new v(i, e), p = {
fill: "#000",
stroke: "none",
font: P._availableAttrs.font,
text: n
};
o.shape = i, o.path = r, o.textpath = s, o.type = "text", o.attrs.text = M(n), o.attrs.x = t, 
o.attrs.y = a, o.attrs.w = 1, o.attrs.h = 1, f(o, p), i.appendChild(s), i.appendChild(r), 
e.canvas.appendChild(i);
var c = K("skew");
return c.on = !0, i.appendChild(c), o.skew = c, o.transform(z), o;
}, P._engine.setSize = function(e, t) {
var a = this.canvas.style;
return (this.width = e) == +e && (e += "px"), (this.height = t) == +t && (t += "px"), 
a.width = e, a.height = t, a.clip = "rect(0 " + e + " " + t + " 0)", this._viewBox && P._engine.setViewBox.apply(this, this._viewBox), 
this;
}, P._engine.setViewBox = function(e, t, a, n, i) {
P.eve("setViewBox", this, this._viewBox, [ e, t, a, n, i ]);
var r, s, o = this.width, p = this.height, c = 1 / E(a / o, n / p);
return i && (a * (r = p / n) < o && (e -= (o - a * r) / 2 / r), n * (s = o / a) < p && (t -= (p - n * s) / 2 / s)), 
this._viewBox = [ e, t, a, n, !!i ], this._viewBoxShift = {
dx: -e,
dy: -t,
scale: c
}, this.forEach(function(e) {
e.transform("...");
}), this;
}, P._engine.initWin = function(e) {
var t = e.document;
t.createStyleSheet().addRule(".rvml", "behavior:url(#default#VML)");
try {
!t.namespaces.rvml && t.namespaces.add("rvml", "urn:schemas-microsoft-com:vml"), 
K = function(e) {
return t.createElement("<rvml:" + e + ' class="rvml">');
};
} catch (a) {
K = function(e) {
return t.createElement("<" + e + ' xmlns="urn:schemas-microsoft.com:vml" class="rvml">');
};
}
}, P._engine.initWin(P._g.win), P._engine.create = function() {
var e = P._getContainer.apply(0, arguments), t = e.container, a = e.height, n = e.width, i = e.x, r = e.y;
if (!t) throw new Error("VML container not found.");
var s = new P._Paper(), o = s.canvas = P._g.doc.createElement("div"), p = o.style;
return i = i || 0, r = r || 0, n = n || 512, a = a || 342, (s.width = n) == +n && (n += "px"), 
(s.height = a) == +a && (a += "px"), s.coordsize = 1e3 * W + R + 1e3 * W, s.coordorigin = "0 0", 
s.span = P._g.doc.createElement("span"), s.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;", 
o.appendChild(s.span), p.cssText = P.format("top:0;left:0;width:{0};height:{1};display:inline-block;position:relative;clip:rect(0 {0} {1} 0);overflow:hidden", n, a), 
1 == t ? (P._g.doc.body.appendChild(o), p.left = i + "px", p.top = r + "px", p.position = "absolute") : t.firstChild ? t.insertBefore(o, t.firstChild) : t.appendChild(o), 
s.renderfix = function() {}, s;
}, P.prototype.clear = function() {
P.eve("clear", this), this.canvas.innerHTML = z, this.span = P._g.doc.createElement("span"), 
this.span.style.cssText = "position:absolute;left:-9999em;top:-9999em;padding:0;margin:0;line-height:1;display:inline;", 
this.canvas.appendChild(this.span), this.bottom = this.top = null;
}, P.prototype.remove = function() {
for (var e in P.eve("remove", this), this.canvas.parentNode.removeChild(this.canvas), 
this) this[e] = "function" == typeof this[e] ? P._removedFactory(e) : null;
return !0;
};
var t = P.st;
for (var a in e) e[L](a) && !t[L](a) && (t[a] = function(a) {
return function() {
var t = arguments;
return this.forEach(function(e) {
e[a].apply(e, t);
});
};
}(a));
}(window.Raphael), function(p) {
p.fn.polartimer = function(e) {
return t[e] ? t[e].apply(this, Array.prototype.slice.call(arguments, 1)) : "object" != typeof e && e ? void p.error("Method " + e + " does not exist on jQuery.polartimer") : t.init.apply(this, arguments);
};
var a = 1e3, t = {
init: function(e) {
var t = {
timerSeconds: 10,
countDown: !1,
callback: function() {},
color: "#CCC",
opacity: 1
};
return t = p.extend(t, e), this.each(function() {
var e = p(this);
e.data("polartimer") || (e.addClass("polartimer"), e.height(e.width()), t.timer = null, 
t.timerCurrent = 0, t.pi2 = 2 * Math.PI, t.piOver2 = Math.PI / 2, t.width = e.width(), 
t.height = e.height(), t.raphael = Raphael(e.context, t.width, t.height), e.data("polartimer", t));
});
},
stopWatch: function() {
return this.each(function() {
var e = p(this).data("polartimer");
if (e) {
var t = (e.timerFinish - new Date().getTime()) / 1e3;
if (t <= 0) t <= -3 ? (clearInterval(e.timer), App.game && !App.game.isRecordedGame() && App.comm.connected() && Logger.reportUserVar({
hanged: 1
})) : t <= 0 && -1 <= t && (p(this).polartimer("drawTimer", e.countDown ? 0 : 100), 
e.callback()); else {
var a = t / e.timerSeconds * 100;
p(this).polartimer("drawTimer", e.countDown ? a : 100 - a);
}
}
});
},
drawTimer: function(o) {
return this.each(function() {
$this = p(this);
var e = $this.data("polartimer");
if (e) {
var t = e.width, a = (e.height, t / 2);
if (e.raphael.clear(), 100 == o) e.raphael.circle(a, a, a).attr({
fill: e.color,
stroke: "none",
opacity: e.opacity
}); else {
var n = e.pi2 * o / 100 - e.piOver2, i = Math.cos(n) * a + a, r = Math.sin(n) * a + a, s = "M" + a + "," + a + " L" + a + ",0 ";
s += "A" + a + "," + a + " 0 " + (o <= 50 ? 0 : 1) + ",1 " + i + "," + r + " ", 
s += "L" + a + "," + a + "z", e.raphael.path(s).attr({
fill: e.color,
stroke: "none",
opacity: e.opacity
});
}
}
});
},
start: function() {
return this.each(function() {
var e = p(this).data("polartimer");
if (e) {
clearInterval(e.timer), e.resumeSeconds = null, e.timerFinish = new Date().getTime() + 1e3 * e.timerSeconds, 
p(this).polartimer("drawTimer", 0);
var t = $this.attr("id");
e.timer = t && "" !== t ? setInterval("$('#" + t + "').polartimer('stopWatch')", a) : setInterval("$this.polartimer('stopWatch')", a);
}
});
},
pause: function() {
return this.each(function() {
var e = p(this).data("polartimer");
e && !e.resumeSeconds && (e.resumeSeconds = (e.timerFinish - new Date().getTime()) / 1e3, 
clearInterval(e.timer));
});
},
resume: function() {
return this.each(function() {
var e = p(this).data("polartimer");
if (e && e.resumeSeconds) {
clearInterval(e.timer), e.timerFinish = new Date().getTime() + 1e3 * e.resumeSeconds, 
e.resumeSeconds = null, p(this).polartimer("drawTimer", 0);
var t = $this.attr("id");
e.timer = t && "" !== t ? setInterval("$('#" + t + "').polartimer('stopWatch')", a) : setInterval("$this.polartimer('stopWatch')", a);
}
});
},
reset: function() {
return this.each(function() {
var e = p(this).data("polartimer");
e && (clearInterval(e.timer), e.resumeSeconds = null, p(this).polartimer("drawTimer", 0));
});
},
destroy: function() {
return this.each(function() {
var e = p(this), t = e.data("polartimer");
t && (clearInterval(t.timer), t.raphael.remove(), e.removeData("polartimer"));
});
}
};
}(jQuery), App = window.App || {}, App.CardGame = Backbone.Model.extend({
defaults: {
gs: {},
recording: !1,
pos: 0
},
setGS: function(e) {
this.set({
gs: e
}, {
silent: !0
});
},
updateKey: function(e, t) {
for (var a, n = [], i = function(e) {
return _.isObject(e) ? _.flatten(_.map(e, function(e, t) {
return "object" == typeof e ? [ t ].concat(_.map(i(e), function(e) {
return t + ":" + e;
})) : t;
})).sort() : [];
}, r = _.clone(e), s = this.get("gs"); 1 < e.length; ) s = s[a = e.shift()];
a = e.shift(), n.push("change:gs");
var o = _.inject(r, function(e, t) {
var a = e + ":" + t;
return n.push(a), a;
}, "change:gs");
return _.each(i(s[a]), function(e) {
n.push(o + ":" + e);
}), _.each(i(t), function(e) {
n.push(o + ":" + e);
}), n = _.uniq(n), s[a] = t, n;
},
read: function(e, t, a) {
for (var n = e.split(/\./), i = !0 === a ? this.previous("gs") : this.get("gs"), r = 0, s = n.length; r < s; r++) if (null == (i = i[n[r]])) return t;
return i;
},
readOld: function(e, t) {
return this.read(e, t, !0);
},
hasKey: function(e, t) {
return this.read(e, !1, t) === this.read(e, !0, t);
},
isChanged: function(e) {
return !_.isEqual(this.read(e, NaN), this.read(e, NaN, !0));
},
load: function() {
this.firstLoad = !0, this.reloading = !1, this.registerCallbacks(), this.startTime = new Date().getTime(), 
this.isRecordedGame() ? App.recordingManager.setup(this.get("pos")) : App.comm.enqueue("engine", "get_gs_json", [ this.gid ]), 
App.sound.loadGameSounds(), this.trigger("loaded"), App.current_user.set("game", this, {
silent: !0
}), App.gameHeader = new App.GameHeader({
model: this,
el: $("#game-header")
}), App.leftUpperBox = new App.LeftUpperBox({
model: this,
el: $("#game-body .top.left .btn-group")
}), App.leftLowerBox = new App.LeftLowerBox({
model: this,
el: $("#game-body .bottom.left .btn-group")
}), App.rightLowerBox = new App.RightLowerBox({
model: this,
el: $("#game-body .bottom.right .btn-group")
}), $(window).scrollTop($("#game-body").offset().top - ($(window).height() - $("#game-body").height() - 50));
},
start: function() {
if ($("#game-body").removeClass("loading").toggleClass("partnering-game", this.read("partnering")), 
Consts.mobile_only_games.includes(App.game.gameName())) App.Lightbox.activate({
title: G._("only_mobile_game"),
klass: "form-horizontal blocks-for-errors",
footer: [ {
type: "button",
name: "app_store",
action: "go"
} ],
content: function() {
return $("<div>").append(G._("only_mobile_game_content")).html();
},
go: function(e) {
e.preventDefault(), window.location.href = "/" + G.lang() + "/mobile/";
}
}); else {
var e = App[this.gameName() + "Game"];
this.originals = _.inject(e, function(e, t, a) {
return this[a] && (e[a] = this[a]), this[a] = t, e;
}, {}, this), _.each(this.gmBinds, function(e) {
this.on(e[0], e[1], this);
}, this), $("#game-body").addClass(_.string.underscored(App.game.gameName())), this.players = [], 
this.seats = [], this.seatViews = [], this.stacks = {}, this.stackViews = {}, this.gameItems = {}, 
this.setupPlayers(), this.loadStacks(), this.trigger("started"), this.firstLoad = !1, 
this.trigger("change:gs:state"), this.trigger("change:gs:game_table"), this.watchGame(), 
this.started = !0;
}
},
die: function() {
if (_.invoke(this.players, "die"), _.invoke(this.seats, "die"), _.invoke(this.seatViews, "die"), 
_.invoke(this.stacks, "die"), _.invoke(this.stackViews, "die"), this.started) {
_.each(this.gmBinds, function(e) {
this.off(e[0], e[1], this);
}, this);
var e = App[this.gameName() + "Game"];
_.each(e, function(e, t) {
delete this[t], this.originals[t] && (this[t] = this.originals[t]);
}, this), delete this.originals, App.game.set({
gs: {}
}, {
silent: !0
}), App.gameActions._byId = {};
var t = App.gameActions.items[0];
App.gameActions.items = [], App.gameActions.addItem(t), clearTimeout(this.watchTimer), 
guiders.hideAll();
}
},
admins: function() {
return this.read("game_options.game_admins");
},
setupPlayers: function() {
if (0 === this.players.length) {
var e, t, a = this.read("num_players");
for (e = 0; e < a; e++) {
var n = this.read("players_info." + e + ".id");
(t = App.coplayers.get(n)) && t.isMember() ? t.set({
game: this,
index: e
}) : t = App.coplayers.ensurePlayer(n, _.extend({
game: this,
index: e
}, this.read("players_info." + e))), this.players.push(t);
}
for (e = 0; e < a; e++) {
var i = (e - App.current_user.get("index") + a) % a;
t = this.players[e];
var r = new this.GameSeatClass({
player: t,
position: i
});
this.seats.push(r);
var s = this.SeatViewClass.getSeatId(i);
this.seatViews.push(new this.SeatViewClass({
model: r,
el: $("#seat-" + s)
}));
}
} else Logger.warn(this, "Called setupPlayers twice");
},
reset: function() {
_.invoke(this.players, "die"), this.players = [], _.invoke(this.seats, "die"), this.seats = [], 
_.invoke(this.seatViews, "die"), this.seatViews = [], _.invoke(this.stacks, "die"), 
this.stacks = {}, _.invoke(this.stackViews, "die"), this.stackViews = {}, this.setupPlayers(), 
this.loadStacks(), this.trigger("change change:gs change:gs:state reset");
},
stackView: function() {
return App.StackView;
},
revertIllegalMove: function() {
_.each(this.stacks, function(e) {
e.readCards();
}), this.trigger("change"), this.trigger("revertIllegalMove");
},
loadStacks: function() {
var e = "stack_table";
this.stacks[e] || (this.stacks[e] = new App.CardStack({
name: e
})), this.stackViews[e] || (this.stackViews[e] = new (this.stackView().TableStack())({
model: this.stacks[e]
})), this.stacks[e].readCards(), _.each(_.range(4), _.bind(function(e) {
var t = "stack_t_" + e;
this.stacks[t] || (this.stacks[t] = new App.CardStack({
name: t
})), this.stackViews[t] || (this.stackViews[t] = new (this.stackView())({
tagName: "div",
className: "card-stack vertical face-up",
model: this.stacks[t],
top: -80,
left: 105 * e - 185,
smallFirst: !1,
closes: !0,
parent: "#game-canvas"
})), this.stacks[t].readCards();
}, this)), _.invoke(this.seats, "loadStacks");
},
positions: [ "Bottom", "Right", "Top", "Left" ],
directions: [ "Right", "Up", "Left", "Down" ],
isCompetitionGame: function() {
return "competition" === this.read("game_type");
},
isRecordedGame: function() {
return this.get("recording");
},
isPunishable: function() {
return this.read("game_options.punishable");
},
isChallengeGame: function() {
return "challenge" === this.read("game_type");
},
isNormalGame: function() {
return "normal" == this.read("game_type") || "ranked" == this.read("game_type");
},
isFirstGame: function() {
return "first_game" === this.read("game_type");
},
isGroupGame: function() {
return !!this.read("game_options.group");
},
reload: function() {
this.isRecordedGame() || this.gid && (this.reloading = !0, App.comm.enqueue("engine", "get_gs_json", [ this.gid ]));
},
registerCallbacks: function() {
App.comm.registerCallback("updateEngine", _.bind(function(e, t) {
e === this.gid && 0 < _.keys(t).length && (this.firstLoad || this.reloading) && (App.game.setGS(t), 
this.reloading ? (this.reset(), this.reloading = !1, this.trigger("started"), this.trigger("change:gs:state")) : (this.start(), 
App.statsCollector.report("gameLoadTime", new Date().getTime() - this.startTime), 
startGuiders("bg_game_viewer_1")));
}, this)), App.comm.registerCallback("runEngineCommands", _.bind(function(e, t) {
e === this.gid && 0 < _.keys(t).length && !this.firstLoad && App.commander.performCmds(t.cmds);
}, this)), App.comm.registerCallback("redirectTo", function(e) {
window.location = "/" + G.lang() + e;
}), App.comm.registerCallback("administration", _.bind(function(i) {
switch (i[0]) {
case "game_complaints":
if (i[1] !== this.gid) return;
$(".complaintsMark, .complaintsContent").remove(), _.each(this.read("players_info"), function(e, t) {
var a = e.id, n = _.map(_.reject(_.select(i[3], function(e) {
return _.include(e, a);
})[0] || [], function(e) {
return e === a;
}), function(t) {
return _.find(this.read("players_info"), function(e) {
return e.id === t;
}).login;
}, this);
a && this.seatViews[t].$(".playerInfo ul li").last().prepend(JST["jsts/hands/user_admin_info"]({
sameIPas: n,
complaints: i[2][a] || []
}));
}, this);
}
}, this)), App.comm.on("connected", function() {
App.game.firstLoad || App.game.reload();
});
},
teams: function() {
if (this.players) {
var i = this.read("partnering") && !this.read("non_partnering_scores");
return _.inject(this.players, function(e, t, a) {
var n = i ? a % 2 : a;
return e[n] || (e[n] = {
players: []
}), e[n].players.push(t), e;
}, []);
}
return [];
},
partneringWithScoresPerPlayer: function() {
return this.read("partnering") && this.read("score_per_player");
},
scoreTeams: function() {
var t = this.teams();
return this.partneringWithScoresPerPlayer() && (t = _.map(_.flatten(_.pluck(t, "players")), function(e) {
return {
players: [ e ]
};
}), t = _.map([ 0, 2, 1, 3 ], function(e) {
return t[e];
})), t;
},
scores: function() {
return !this.read("partnering") || this.read("score_per_player") || this.read("non_partnering_scores") ? this.read("overall_scores") : this.read("team_scores");
},
handName: function() {
var e = this.read("current_hand");
return e ? e.slice(this.read("current_hand").lastIndexOf("::") + 2).toLowerCase() : "";
},
inState: function(e) {
return _.isArray(e) ? _.include(e, this.read("state")) : this.read("state") === e;
},
playerHasTurn: function(e) {
return this.inState("in_hand") && this.read("hs.player_turn") === e;
},
dealer: function() {
return this.players[this.read("dealer")];
},
iAmDealer: function() {
return this.read("dealer") === this.getActingIndex() && !App.current_user.isWatcher();
},
iAmGameStarter: function() {
return !App.current_user.isWatcher() && !_.inject(this.read("players_info"), _.bind(function(e, t, a) {
return !!(a < App.current_user.get("index") && t.id) || e;
}, this), !1);
},
iAmOriginalCreator: function() {
return this.read("creator_id") === App.current_user.get("id");
},
iHaveTurn: function() {
return !App.current_user.isWatcher() && this.playerHasTurn(App.current_user.get("index"));
},
getActingIndex: function() {
return App.game.isRecordedGame() ? null : App.current_user.get("index");
},
inHand: function(e) {
return _.isArray(e) ? -1 < _.indexOf(e, this.handName()) : this.handName() === e;
},
gameName: function() {
return this.read("module") ? this.read("module").match(/::([^:]*)/)[1] : "";
},
gameIs: function(e) {
return _.isArray(e) ? -1 < _.indexOf(_.invoke(e, "toLowerCase"), this.gameName().toLowerCase()) : this.gameName().toLowerCase() === e.toLowerCase();
},
getBashaTheme: function(e) {
0 !== e.length && App.StackView.setBackgroundURLs(e);
},
cardClass: function() {
return "Okey" === this.gameName() ? "tile" : "";
},
playerClasses: function() {
return "";
},
winners: function() {
return _.map(this.read("final_result").winners, function(e) {
return e[0];
});
},
isWinner: function(e) {
return _.include(this.winners(), e);
},
canSit: function() {
return !0;
},
gameSpeed: function() {
var e = this.read("game_options.play_timeout");
return Consts.play_timeouts[e];
},
gameSpeedOrSeconds: function() {
var e = this.read("game_options.play_timeout");
return G._(this.gameSpeed()) || e + G._("filters.time_unit");
},
sponsor: function() {
return this.get("gs").game_options.sponsor;
},
cardMoveSound: function() {
this.inState("in_hand") && App.sound.play("card_played");
},
watchGame: function() {
this.gid && App.current_user.isWatcher() && !this.isRecordedGame() && App.comm.sendGame("watch"), 
this.gid && (this.watchTimer = setTimeout(_.bind(this.watchGame, this), 3e4));
}
}, {
newGameHash: function(e) {
var t = _.extend({
gmBinds: [],
classBind: function(e, t, a) {
void 0 !== a && (this.gmBinds = _.select(this.gmBinds, function(e) {
return e[2] !== a;
})), this.gmBinds.push([ e, t, a ]);
}
}, e);
return t.gmBinds = _.clone(t.gmBinds), t;
},
sponsorImgURL: function() {
return "https://s3.amazonaws.com/j-models/sponsors/" + Consts.env + "/";
},
sponsorCompImgURL: function() {
return "https://s3.amazonaws.com/j-models/sponsors/" + Consts.env + "/";
}
}), App.game = new App.CardGame(), function() {
App = window.App || {};
var a, I = [], n = !1, i = !1;
App.commander = {
performCmd: function(e) {
function t(e) {
var t = App.game.stacks[r];
t && t.removeCard(e), (f += 1) === g && App.commander.continueQueue();
}
var a, n, i, r = e[1];
switch (e[0]) {
case "move":
if ("Banakil" === App.game.gameName()) return !0;
var s, o = e[2], p = e[3], c = e[4], d = App.game.stacks[o], l = App.game.stacks[r];
if (d && -1 !== p && d.getCard(p)) return !0;
var u = -1 !== l.owner() && "stack_table" === o, h = u ? {
silent: !0
} : {};
return (s = l.getCard(p)) || (s = l.get("cards").find(function(e) {
return -1 === e.val();
})), s || (s = l.get("cards").first()), s ? (l.removeCard(s, h), s.set({
id: -1 !== parseInt(p, 10) ? parseInt(p, 10) : null
}, {
silent: !0
}), !d.closed() || !App.current_user.isWatcher() && d.owner() === App.current_user.get("index") || -1 !== d.owner() && App.game.isRecordedGame() || s.set({
id: null
}, {
silent: !0
}), d.addCard(s, c, h), u ? App.game.stackViews[o].playCard(s, l, !0) : ($("#card-" + s.cid).addClass("recent"), 
setTimeout(function() {
$("#card-" + s.cid).removeClass("recent");
}, 1e3)), App.game.trigger("cardMove", {
from: r,
to: o,
card: p,
index: c
}), !0) : (Logger.error("Commander Move Card: Card does not exist."), !1);

case "flush":
a = e[2], n = App.game.seatViews[a];
var m = App.game.stacks[r].get("cards"), g = m.length, f = 0;
return m.each(function(e) {
1 > I.length ? _.defer(function() {
t(e);
}) : _.delay(function() {
$("#card-" + e.cid).animate({
margin: 0,
opacity: 0,
left: n.domPosition.left - App.Card.width / 2,
top: n.domPosition.top - App.Card.height / 2
}, {
complete: function() {
t(e);
}
});
}, 500);
}), !1;

case "flushCertainCards":
a = e[1];
var A = e[2], v = A.length;
return n = App.game.seatViews[a], _.each(A, function(t) {
var e = _.detect(App.game.stacks, function(e) {
return e.get("cards").get(t);
}), a = e && e.get("cards").get(t);
a ? _.delay(function() {
$("#card-" + a.cid).animate({
opacity: 0,
left: n.$el.position().left,
top: n.$el.position().top
}, {
complete: function() {
e.removeCard(a), 0 === (v -= 1) && App.commander.continueQueue();
}
}), n.shakeAvatar();
}, 200) : (Logger.error("The flushCertainCards command failed. Card does not exist."), 
App.game.reset(), 0 === (v -= 1) && App.commander.continueQueue());
}), !1;

case "afterSeatChange":
return App.game.reset(), !0;

case "startGame":
return App.game.loadStacks(), !0;

case "pass":
return App.game.trigger("trixPass"), !0;

case "redirectTo":
var b = e[1];
return i = e[2], App.current_user.get("id") === i && _.delay(function() {
App.gamesRouter.navigate("/" + G.lang() + b, {
trigger: !0
});
}, 50), !0;

case "kickOut":
var y = e[1];
return i = e[2], App.current_user.get("id") === i && ($("#alerts").html('<div class="alert alert-heading top"><a class="close" href="#" data-dismiss="alert">\xd7</a><p>' + G._(y) + "<p></div>"), 
App.game.reload()), !0;

case "loadStacks":
return App.game.loadStacks(), !0;

case "forceLoadStacks":
return App.game.loadStacks(!0), !0;

case "loadMyStacks":
return App.game.loadStacks(!0, !0), !0;

case "loadCertainStacks":
return _.each(e[1], function(e) {
App.game.stacks[e].readCards();
}), !0;

case "reShuffle":
var k = e[1];
return App.game.loadStacks(), k || App.sound.play("shuffle"), !0;

case "playSound":
var x = e[1], w = e[2];
switch (x.toString()) {
case "baloot_projects":
soundName = e[3], bubbleText = e[4], App.sound.play(soundName), App.game.vaporize(w, G._(bubbleText));
break;

case "baloot_ikka":
App.sound.play("baloot_ikka");
break;

case "handgame":
case "hareega":
App.sound.play(e[2]);
}
return !0;

case "action":
var C = Consts.actions[e[1]];
return C && C.shareable && (!App.whiteLabel.domain || App.whiteLabel.promote_jawaker) && (0 < C.xp_reward ? App.KarimNotification.activate({
actionInfo: e[2]
}) : App.actionPublish(e[2])), !0;

case "reset":
return App.game.reset(), !0;

case "highlightCards":
var S = e[1], T = App.game.stacks["stack_p_" + App.current_user.get("index")], B = App.game.stackViews["stack_p_" + App.current_user.get("index")];
return _.each(S, function(e) {
B.$("#card-" + T.getCard({
id: e
}).cid).addClass("recent");
}), setTimeout(function() {
$(".card.recent").removeClass("recent");
}, 3e3), !0;

default:
return !0;
}
},
performCmds: function(e) {
var t = $.extend(!0, {}, App.game.get("gs")), n = [];
_.each(e, function(e) {
if ("change" === e[0]) {
var t = e[1], a = e[2];
3 < e.length && "mobile_only" === e[3] || (n = _.union(n, App.game.updateKey(t, a)));
}
}, this), n.length && (App.game._previousAttributes.gs = t, _.each(n.reverse(), function(e) {
App.game.trigger(e);
}), App.game.trigger("change")), _.each(e, function(e) {
"change" !== e[0] && this.addToQueue(e[0], _.bind(this.performCmd, this, e));
}, this);
},
performCmdExternal: function(e) {
this.addToQueue(e[0], _.bind(this.performCmd, this, e));
},
addToQueue: function(e, t) {
I.push([ e, t ]), a && n && 8e3 < new Date().getTime() - a ? this.continueQueue() : i || this.runNextFunction();
},
runNextFunction: function() {
if (!n) if (0 !== I.length) {
var e = I.shift();
Logger.debug(App.commander, "App.commander is running next function: " + e[0]), 
e[0], a = new Date().getTime(), e[1]() ? (i = !0, _.defer(_.bind(this.runNextFunction, this))) : i = !(n = !0);
} else i = !1;
},
continueQueue: function() {
n = !1, this.runNextFunction();
}
};
}(), App = window.App || {}, App.GameHeader = App.ListView.extend({
template: JST["jsts/games/header"],
items: [ {
id: "NumRounds",
name: function() {
return G._("challenge.num_rounds");
},
visible: function() {
return this.model.isChallengeGame();
},
value: function() {
return _.string.sprintf("<div class='summary-icon'>%s</div>", this.model.read("challenge_options.num_rounds"));
}
}, {
id: "Prize",
name: function() {
return G._("prize") + ": " + this.model.read("challenge_options.prize");
},
visible: function() {
return 0 < this.model.read("challenge_options.prize");
},
value: function() {
return "<i class='fa fa-trophy'></i>";
}
}, {
id: "Powerups",
name: function() {
return G._("challenge.powerups");
},
visible: function() {
return this.model.read("challenge_options.powerups");
},
value: function() {
return "<i class='fa fa-magic'></i>";
}
}, {
id: "Challenger",
name: function() {
return this.model.read("challenger.login");
},
visible: function() {
return this.model.isChallengeGame();
},
value: function() {
return _.string.sprintf("<div class='avatar' data-profile-id='%s'><a href='#'>%s</a></div>", this.model.read("challenger.id") || 0, App.User.lazyAvatarImg(this.model.read("challenger")));
}
}, {
id: "Timer",
name: function() {
return G._("Game Speed") + ": " + this.model.gameSpeedOrSeconds();
},
monitoredEvents: [ "change:gs:game_options:play_timeout" ],
visible: function() {
return !this.model.isChallengeGame();
},
value: function() {
return this.model.gameSpeed() ? "<i class='jicon-" + this.model.gameSpeed() + "-speed'></i>" : "<div class='summary-icon timer'>" + this.model.gameSpeedOrSeconds() + "</div>";
}
}, {
id: "MinLevel",
name: "Minimum Level",
monitoredEvents: [ "change:gs:by_level" ],
visible: function() {
var e = this.model.read("by_level");
return e && 1 < e;
},
value: function() {
return _.string.sprintf("<div class='summary-icon'>%s</div>", this.model.read("by_level"));
}
}, {
id: "NoGuests",
name: "No Guests",
monitoredEvents: [ "change:gs:game_options:no_guests" ],
visible: function() {
return this.model.read("game_options.no_guests");
},
value: function() {
return "<i class='jicon-jawaker'></i>";
}
}, {
id: "NoKicking",
name: "No kicking",
monitoredEvents: [ "change:gs:game_options:no_kick_or_reseat" ],
visible: function() {
return this.model.read("game_options.no_kick_or_reseat");
},
value: function() {
return "<i class='jicon-no-kicking'></i>";
}
}, {
id: "Punishable",
name: "Punishable",
monitoredEvents: [ "change:gs:game_options:punishable" ],
visible: function() {
return this.model.read("game_options.punishable");
},
value: function() {
return "<i class='fa fa-key'></i>";
}
}, {
id: "Passowrd",
name: function() {
var e = this.model.read("password");
return e ? G._("Password") + ": " + App.escapeHTML(e) : G._("Private Game");
},
monitoredEvents: [ "change:gs:password_protected", "change:gs:password" ],
visible: function() {
return this.model.read("password_protected") || this.model.read("password");
},
value: function() {
return "<i class='fa fa-lock'></i>";
}
}, {
id: "Recording",
name: "The game is being recorded",
visible: function() {
return this.model.isCompetitionGame() && !this.model.isRecordedGame();
},
value: function() {
return "<div class='summary-icon recording'>REC</div>";
}
}, {
id: "Watchers",
name: function() {
return _.compact(_.pluck(_.values(this.model.read("watchers_info")), "login")).join(G._(", "));
},
monitoredEvents: [ "change:gs:watchers_info" ],
visible: function() {
return !this.model.isChallengeGame();
},
klass: "watchers",
value: function() {
return '<i class="fa fa-eye"></i><strong dir="' + (App.rtl ? "rtl" : "ltr") + '">' + G.pluralize(_.keys(this.model.read("watchers_info")).length, "watcher") + "</strong>";
}
} ],
initialize: function() {
App.ListView.prototype.initialize.apply(this, arguments), this.model.on("started", this.render, this), 
this.model.on("change:gs:creator_name", this.render, this), this.model.on("change:gs:watchers_info", this.render, this);
}
}), App = window.App || {}, App.LeftUpperBox = App.ButtonList.extend({
defaultKlass: "btn-primary",
top: !1,
left: !1,
initialize: function() {
App.ButtonList.prototype.initialize.apply(this, arguments), App.shylock.collection.cleanObserve("reset", [ this ], this.render, this);
},
items: [ {
id: "changeTheme",
name: "Change game theme",
visible: function() {
return !App.current_user.isWatcher() && "competition" !== this.model.read("game_type") && this.model.iAmOriginalCreator() && !App.game.isChallengeGame();
},
onClick: function() {
App.comm.enqueue("goods", "list_store_and_my_items", [ App.game.gid ]);
},
monitoredEvents: [ "change:players", "change:gs:game_type" ]
} ]
}), App = window.App || {}, App.LeftLowerBox = App.ButtonList.extend({
defaultKlass: "btn-primary",
top: !1,
numOutside: 2,
left: !1,
items: [ {
id: "inviteFriends",
name: "Invite to game",
visible: function() {
return !App.current_user.isWatcher() && "competition" !== this.model.read("game_type") && _.any(this.model.players, function(e) {
return e.isAI();
}) && !App.game.isChallengeGame();
},
onClick: function() {
App.selectFriends({
extraListNames: [ "facebook" ],
callback: function(e) {
App.User.inviteToGame(e);
},
fb_callback: function(e) {
var t = G._("fb_game_invite", {
gm: G._(App.game.gameName())
}), a = "/" + G.lang() + "/games/" + App.game.gameName().underscore();
App.FB.invite(e, {
message: t,
data: JSON.stringify({
url: a
})
});
}
});
},
monitoredEvents: [ "change:players", "change:gs:game_type" ]
} ]
}), App = window.App || {}, App.RightLowerBox = App.ButtonList.extend({
top: !1,
left: !1,
makeDropDown: function() {
this.$el.append(" <a class='btn btn-small btn-translucent dropdown-toggle' data-toggle='dropdown' href='#'><i class='fa fa-cog fa-lg'></i></a>"), 
this.$el.append(_.string.sprintf("<ul class='dropdown-menu %s %s'></ul>", this.top ? "" : "bottom-up", this.left ? "" : "flush-right"));
},
items: [ {
id: "JoinGame",
name: "Join Game",
klass: "btn-primary",
visible: function() {
return App.current_user.isWatcher() && !this.model.isRecordedGame() && !this.model.inState("dead") && _.compact(_.pluck(this.model.read("players_info"), "id")).length < this.model.read("num_players");
},
onClick: function() {
App.current_user.joinGame(App.game.gid);
},
monitoredEvents: [ "change:players", "change:gs:num_players" ]
}, {
id: "LeaveGame",
name: "Leave",
klass: "btn-red",
visible: function() {
return !App.current_user.isWatcher() && !this.model.inState("after_hands") && !this.model.isChallengeGame();
},
onClick: function() {
var e;
e = App.game.gameName().match(/baloot|kout|nathala|tarneeb_syrian41|tarneeb_egyptian|estimation/i) ? G._(App.game.gameName().toLowerCase() + "_leaving_confirmation") : G._("general_leaving_confirmation");
var t = this.model.isPunishable() && !this.model.inState("new_game") ? G._("punishable_leave_alert") : e;
this.model.isFirstGame() && (t = ""), App.confirm(function() {
App.comm.sendGame("leave", {
ref: "right_lower_box"
});
}, this, t);
},
monitoredEvents: [ "change:players", "change:gs:state" ]
}, {
id: "SoundOn",
name: "Sounds On",
visible: function() {
return 0 === $(".slider-game .ui-slider").rtl_slider("value");
},
onClick: function() {
$(".slider-game .ui-slider").rtl_slider("value", "ar" === G.lang() ? -100 : 100), 
this.model.trigger("change:sound:mute");
},
monitoredEvents: [ "change:sound:mute" ]
}, {
id: "SoundOff",
name: "Sounds Off",
visible: function() {
return 0 !== $(".slider-game .ui-slider").rtl_slider("value");
},
onClick: function() {
$(".slider-game .ui-slider").rtl_slider("value", 0), this.model.trigger("change:sound:mute");
},
monitoredEvents: [ "change:sound:mute" ]
}, {
id: "changeGameParams",
name: "Change Game Parameters",
bashaOnly: !0,
visible: function() {
return !App.current_user.isWatcher() && "competition" !== this.model.read("game_type") && this.model.iAmOriginalCreator() && !this.model.isChallengeGame() && !_.isEmpty(App.game.get("gs").changeable_params);
},
onClick: function() {
App.changeParamsLB.activate();
},
monitoredEvents: [ "change:players", "change:gs:game_type", "change:gs:creator_id" ]
}, {
id: "pauseGame",
name: "Pause Game",
bashaOnly: !0,
visible: function() {
return !App.current_user.isWatcher() && "competition" !== this.model.read("game_type") && this.model.iAmOriginalCreator() && !this.model.inState([ "paused", "new_game", "game_ready" ]) && !this.model.isChallengeGame();
},
onClick: function() {
this.model.read("allow_pausing") ? App.game.inState("paused") || App.pauseGameLB.activate() : App.Lightbox.error(G._("game_options.pausing_not_allowed"));
},
monitoredEvents: [ "change:players", "change:gs:state", "change:gs:game_type", "change:gs:creator_id" ]
} ]
}), App = window.App || {}, App.GameActions = App.ButtonList.extend({
makeItem: function(e) {
var t = _.isFunction(e.name) ? e.name() : e.name, a = _.isFunction(e.btnClasses) ? e.btnClasses() : e.btnClasses || "btn-primary";
return _.string.sprintf(" <a class='btn %s' data-item='%s' href='#'><span class='label'>%s</span></a>", a, e.id, G._(t));
},
items: [ {
id: "StartGame",
name: "Start Game",
visible: function() {
return this.model.iAmGameStarter() && (this.model.inState("game_ready") || this.model.inState("new_game") && _.compact(_.pluck(this.model.read("players_info"), "id")).length >= this.model.read("players_to_start", 2));
},
onClick: function() {
App.comm.sendGame("start");
},
monitoredEvents: [ "change:gs:state" ]
} ],
render: function() {
return App.current_user.isPlaying() && (this.isVisible() ? this.$el.closest(".player").addClass("with-actions") : this.$el.closest(".player").removeClass("with-actions"), 
App.ButtonList.prototype.render.apply(this, arguments)), this;
}
}), App = window.App || {}, App.GameMessage = Backbone.View.extend({
initialize: function() {
this.model.on("started change", this.render, this);
},
message: function() {
if (_.isFunction(App.game.gameMessage)) return App.game.gameMessage();
},
render: function() {
var e = this.message();
return !App.current_user.isWatcher() && e ? this.$el.html(G._(e)).show() : this.$el.hide().empty(), 
this;
}
}, {
setup: function() {
App.gameMessage = new App.GameMessage({
model: App.game,
el: $("#game-message")
}).render();
}
}), App.GameSummary = Backbone.View.extend({
events: {
"click #full-scores": "scoresLB"
},
initialize: function() {
this.model.observe("change:gs", this.updateSummary, this), this.model.observe("started", this.render, this);
},
scoresLB: function(e) {
App.Lightbox.activate({
template: JST["jsts/hands/scores_tab"],
optional: !0,
backdrop: !1,
title: G._("Full Scores"),
inGame: !0,
name: function() {
return "scoresLB";
},
footer: JST["jsts/templates/modalFooter"]({
buttons: [ {
type: "a",
name: "Close",
action: "cancel"
} ]
})
}), e.preventDefault();
},
updateSummary: function() {
this.$("#tab-game-summary .module-content").html(JST["jsts/hands/game_summary"]({})), 
"between_hands" !== App.game.readOld("state") && App.game.inState("between_hands") && ($("#game-summary-module a[href='#tab-game-summary']").click(), 
$(".game-score").stop(!0, !0).fadeOut(500).fadeIn(500).fadeOut(500).fadeIn(500));
},
render: function() {
this.$el.html(JST["jsts/hands/sidebar_top"]({})), this.updateSummary();
new App.LastRoundTab({
model: App.game,
el: $("#tab-last-round .module-content")
}).render();
return App.game.isChallengeGame() && (App.powerUpsTab = new App.PowerUpsTab({
model: App.game,
el: $("#tab-power-ups .module-content")
}).render()), this;
}
}, {
setup: function() {
App.game.gid && (App.gameSummary = new App.GameSummary({
el: $("#game-summary-module"),
model: App.game
}));
},
gameInfo: function() {
return App.game.gameSummaryInfo();
}
}), App.GameSummaryView = Backbone.View.extend({
template: JST["jsts/games/summary"],
clicked: !1,
events: {
'click [data-action="playAgain"]': "playAgain",
'click [data-action="closeAd"]': "closeAd",
'click [data-action="clickAd"]': "clickAd"
},
playAgain: function(e) {
e.stopPropagation(), e.preventDefault(), App.current_user.isMember() ? this.clicked || (this.clicked = !0, 
App.comm.sendGame("play_again"), $(e.currentTarget).append("<img src='/images/loading.gif' class='loadingGif' />")) : App.mustLoginLB.activate();
},
closeAd: function(e) {
App.game.get("gs").game_options.sponsor = null, this.render(), e.stopPropagation(), 
e.preventDefault();
},
clickAd: function(e) {
var t = App.game.sponsor();
t && !t.id && (e.preventDefault(), window.open("/" + G.lang() + "/sponsors/click_ad?sponsor_name=" + t.name));
},
render: function() {
if (App.game.gid) {
App.rightLowerBox.$el.hide(), $("#game-body-overlay").show(), this.$el.html(this.template({
view: this
}));
var e = App.game.sponsor();
return e && !e.video ? (e.id ? this.$el.css({
"background-image": "url(" + App.CardGame.sponsorCompImgURL(e.id, "background") + ")"
}) : this.$el.css({
"background-image": "url(" + App.CardGame.sponsorImgURL(e.name, "game-summary") + ")",
cursor: "pointer"
}), this.$el.find(".head").css({
background: "black",
opacity: .75
}), $("span.name").hide()) : (this.$el.css({
"background-image": "none",
cursor: "auto"
}), this.$el.find(".head").css("background", "none"), $("span.name").show()), this;
}
},
unrender: function() {
App.rightLowerBox.$el.show(), $("#game-body-overlay").hide(), this.$el.html("");
}
}), App = window.App || {}, App.Card = Backbone.Model.extend({
val: function() {
return null === this.id ? -1 : this.id % 54;
},
isJoker: function() {
return _.include([ 52, 53 ], this.val());
},
suit: function() {
return Math.floor(this.val() / 13);
},
rank: function() {
return this.isJoker() ? "Joker" : this.val() % 13;
},
jokerColor: function() {
return this.isJoker() ? 53 === this.val() ? "black" : "red" : "";
},
human: function() {
return this.isJoker() ? "Joker" : -1 < this.val() ? this.constructor.Ranks[this.rank()] + this.constructor.Suits[this.suit()].substr(0, 1) : "";
},
fullName: function(e) {
return this.isJoker() ? (e ? G._("the ") : "") + G._("Joker") : -1 < this.val() ? G._((e ? "uniq_" : "") + "card_fullname", {
rank: G._(this.constructor.RankNames[this.rank()]),
suit: G._(this.constructor.Suits[this.suit()])
}) : "";
},
uniqFullName: function() {
return this.fullName(!0);
},
stack: function() {
return _.find(App.game.stacks, function(e) {
return e.get("cards").include(this);
}, this);
},
remove: function(e) {
var t = this.stack();
t && t.removeCard(this, e);
}
}, {
RealSuits: [ "Hearts", "Spades", "Diamonds", "Clubs" ],
Suits: [ "Hearts", "Spades", "Diamonds", "Clubs", "Jokers" ],
Ranks: [ 2, 3, 4, 5, 6, 7, 8, 9, 10, "J", "Q", "K", "A" ],
RankNames: [ "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Jack", "Queen", "King", "Ace" ],
val: function(e) {
return new App.Card({
id: e
}).val();
},
isJoker: function(e) {
return new App.Card({
id: e
}).isJoker();
},
human: function(e) {
return new App.Card({
id: e
}).human();
},
fullName: function(e) {
return new App.Card({
id: e
}).fullName();
},
uniqFullName: function(e) {
return new App.Card({
id: e
}).uniqFullName();
},
width: 53,
height: 72
}), App.Cards = Backbone.Collection.extend({
model: App.Card
}), App = window.App || {}, App.CardStack = Backbone.Model.extend({
defaults: {
closed: !0,
hidden: !1,
extendsStack: null,
cards: null,
alwaysClosed: !1
},
initialize: function() {
this.set({
cards: new App.Cards()
}, {
silent: !0
}), this.get("cards").cleanBind("all", [ this ], function() {
var e = this.get("extendsStack") ? App.game.stacks[this.get("extendsStack")] : null;
e && (e.trigger("change:cards"), e.trigger("change")), this.trigger("change:cards"), 
this.trigger("change");
}, this), App.game.cleanBind("change:gs:hs:stacks:" + this.get("name"), [ this ], this.update, this), 
this.update();
},
die: function() {
this.trigger("died");
},
update: function() {
this.set({
kind: App.game.read("hs.stacks." + this.get("name") + ".kind", this.kind()),
owner: App.game.read("hs.stacks." + this.get("name") + ".owner", this.owner()),
closed: App.game.read("hs.stacks." + this.get("name") + ".closed", this.closed())
});
},
isUpToDate: function() {
var e = _.pluck(_.clone(App.game.read("hs.stacks." + this.get("name") + ".contains_new")), "val").sort(), t = this.get("cards").pluck("id").sort();
if (e.length !== t.length) return !1;
for (var a = 0; a < e.length; a++) if (e[a] !== t[a]) return !1;
return !0;
},
readCards: function() {
this.get("cards").reset(_.map(App.game.read("hs.stacks." + this.get("name") + ".contains_new"), function(e) {
return {
id: -1 === parseInt(e.val, 10) || this.get("alwaysClosed") ? null : parseInt(e.val, 10)
};
}, this));
},
allCards: function() {
var t = this.get("cards").toArray();
return _.each(App.game.stacks, function(e) {
e.get("extendsStack") === this.get("name") && (t = t.concat(e.get("cards").toArray()));
}, this), t;
},
getCard: function(e) {
return this.get("cards").get(e);
},
getCardVals: function() {
return this.get("cards").map(function(e) {
return e.val();
});
},
removeCard: function(e, t) {
e ? this.get("cards").remove(e, t) : Logger.error("Called stack.removeCard() for a card that doesn't exist.");
},
addCard: function(e, t, a) {
!a && _.isObject(t) && (a = t, t = null), this.get("cards").add(e, _.extend(_.isNumber(t) ? {
at: t
} : {}, a || {}));
},
moveCardsTo: function(t, a) {
this !== t && _.each(this.get("cards").toArray(), function(e) {
this.removeCard(e, a), t.addCard(e, a);
}, this);
},
switchCardsWith: function(e, t) {
if (this !== e) {
var a = new App.CardStack();
this.moveCardsTo(a, t), e.moveCardsTo(this, t), a.moveCardsTo(e, t);
}
},
removeCards: function() {
this.get("cards").reset();
},
kind: function() {
return this.get("kind");
},
owner: function() {
return this.get("owner");
},
closed: function() {
return this.get("closed");
},
empty: function() {
return this.get("cards").isEmpty();
}
}), App.CardStacks = Backbone.Collection.extend({
model: App.CardStack
}), App = window.App || {}, App.game.fillerCard = new App.Card({
id: -2
}), App.game.oldIndex = null, App.game.isDragging = !1, App.game.within_droppables = [], 
App.game.current_droppable = null, App.StackView = Backbone.View.extend({
events: {
"click .card": "clickMux",
"mouseover .card": "cardMouseOver",
"mouseout .card": "cardMouseOut"
},
initialize: function(e) {
this.attrs(e), this.model.cleanBind("change", [ this ], this.render, this);
},
top: null,
left: null,
right: null,
style: null,
orientation: 0,
closed: !1,
closes: !1,
smallFirst: !0,
firstTop: !1,
ordered: !0,
showEmpty: !1,
noReload: !1,
canClick: !1,
parent: null,
selector: null,
draggable: function() {
return this.model.owner() === App.game.getActingIndex();
},
droppable: !0,
dynamicWidth: !1,
canDrop: function() {
return !0;
},
hoverClass: "highlightedStack",
selectNumCards: !1,
withFillerCard: !1,
attrs: function(e) {
var a = this.constructor.attrs;
return e && _.each(e, function(e, t) {
_.include(a, t) && (this[t] = e);
}, this), _.inject(a, function(e, t) {
return e[t] = this[t], e;
}, {}, this);
},
clickMux: function(e) {
if (this.selectNumCards) {
var t = $(e.target).closest(".card");
if (t.hasClass("chosencard doubled")) return;
t.hasClass("chosencard") ? t.removeClass("chosencard") : this.$(".chosencard:not(.doubled)").length < this.selectNumCards && t.addClass("chosencard");
} else this.cardClick(e);
},
selectedCards: function() {
return _.map(this.$(".chosencard:not(.doubled)"), function(e) {
return $(e).data("card").val();
});
},
clearSelectedCards: function() {
this.selectNumCards = !1, this.$(".chosencard:not(.doubled)").removeClass("chosencard");
},
cardClick: function(e) {
if (0 === e.clientX && 0 === e.clientY || e.clientY === undefined || e.clientX === undefined) return !1;
var t = $(e.target).closest(".card"), a = t.data("card"), n = t.data("stack");
return a ? (-1 === a.val() && "d" !== n.kind() ? App.minion.doAdClick() : !App.current_user.isWatcher() && this.canPlay(a, n) && (this.$el.removeClass("selectedstack"), 
this.onClick(a, n)), $("#chatMsg:enabled").focus(), !1) : void 0;
},
onClick: $.noop,
canPlay: $.noop,
onDrop: $.noop,
onStackMouseMove: function(e, t) {
if (!this.closed) {
var a = this.offsetCardIndex(e, t);
a !== App.game.oldIndex && (App.game.oldIndex = a, App.game.fillerCard.remove({
silent: App.game.fillerCard.stack() === this.model
}), this.model.addCard(App.game.fillerCard, a));
}
},
onMouseOver: function(e) {
$(".selectedcard").removeClass("selectedcard"), $(".selectedstack").removeClass("selectedstack"), 
$("#card-" + e.cid).addClass("selectedcard"), this.$el.addClass("selectedstack");
},
onMouseOut: function() {
$(".selectedcard").removeClass("selectedcard"), this.$el.removeClass("selectedstack");
},
cardMouseOver: function(e) {
var t = $(e.target).closest(".card"), a = t.data("card"), n = t.data("stack");
App.current_user.isWatcher() || !this.canPlay(a, n) && !this.selectNumCards || this.onMouseOver.call(this, a);
},
cardMouseOut: function(e) {
var t = $(e.target).closest(".card").data("card");
this.onMouseOut.call(this, t);
},
die: function() {
this.remove(), this.el = null, this.model = null, this.trigger("died");
},
makeCardElem: function(n) {
var i = n.stack(), e = $(JST["jsts/games/playing_card"]({
card: n
})).data({
card: n,
stackView: this,
stack: i
});
return i.get("name").match(/^stack_pv_/) && e.addClass("chosencard doubled"), App.game.gameIs("texas") && !_.isEmpty(App.game.read("winning_hand", [])) && (_.include(App.game.read("winning_hand", []), n.id.toString()) ? e.addClass("winning-card") : e.addClass("non-winning-card")), 
(_.isFunction(this.draggable) ? this.draggable() : this.draggable) && !App.current_user.isWatcher() && e.draggable({
revert: "invalid",
appendTo: "#game-body",
zIndex: 1e4,
helper: "clone",
opacity: .35,
cursorAt: {
top: 5,
left: 5
},
start: _.bind(function(e, t) {
App.game.isDragging = !0, App.game.within_droppables = this.canDrop() ? [ this ] : [], 
this.updateCurrentDroppable(), t.helper.data({
card: n,
stackView: this,
stack: i
});
var a = $("#card-" + n.cid);
t.helper.css("margin-top", a.css("margin-top")), t.helper.css("margin-left", a.css("margin-left")), 
a.hide(), this.canDrop() && !this.closed && this.withFillerCard && (App.game.oldIndex = a.index(), 
i.addCard(App.game.fillerCard, App.game.oldIndex));
}, this),
stop: _.bind(function() {
App.game.isDragging = !1, this.$("#card-" + n.cid).show(), this.resetWidth();
}, this),
drag: _.bind(function(e, t) {
App.game.current_droppable && this.withFillerCard && App.game.current_droppable.onStackMouseMove(e, t.helper);
}, this)
}), e;
},
offsetCardIndex: function(e) {
var t = e.originalEvent.pageX, a = this.$el.children(":visible"), n = a.length ? a.first().offset().left : 0, i = a.length ? a.last().outerWidth(!0) : 1, r = Math.max(0, Math.floor((t - n) / i));
return r + this.$el.children().slice(0, r + 1).filter(":hidden").length;
},
addCards: function(n, e) {
n = n || this.$el, e = e || this.model.allCards();
var t = _.pluck(e, "cid"), i = n.children();
_.each(i, function(e) {
_.include(t, e.id.split("-")[1]) || $(e).remove();
}), i = _.inject(i, function(e, t) {
return e[t.id.split("-")[1]] = $(t), e;
}, {}), this.ordered && (this.cardsSort ? e.sort(_.bind(function(e, t) {
return this.cardsSort(e.val(), t.val());
}, this)) : e.sort(_.bind(function(e, t) {
return e.val() - t.val();
}, this)), this.smallFirst || e.reverse()), this.closes && 13 === e.length ? n.addClass("collapsed") : n.removeClass("collapsed"), 
n[this.closed ? "addClass" : "removeClass"]("closed"), _.each(e, function(e, t) {
if (!i[e.cid]) {
var a = n.find(".card").eq(t);
a.length ? a.before(this.makeCardElem(e)) : n.append(this.makeCardElem(e));
}
}, this);
},
attach: function() {
this.$el.parent().length || (this.parent && $(this.parent).length ? (Logger.debug(App.StackView, "Attaching view for " + this.model.get("name") + " to parent"), 
$(this.parent).append(this.el), this.parent = null, _.each([ "top", "left", "right" ], function(e) {
null !== this[e] && this.$el.css(e, this[e]);
}, this), this.style && this.$el.css(this.style)) : this.selector && $(this.selector).length && (Logger.debug(App.StackView, "Attaching view for " + this.model.get("name") + " to selector"), 
this.setElement($(this.selector))));
},
setPosition: function(e) {
this.attrs(this.constructor.positionAttrs(e));
},
updateCurrentDroppable: function() {
var e = App.game.within_droppables[0] || null, t = App.game.current_droppable;
t !== e && (t && t.$el.removeClass("hasfocus"), e && e.$el.addClass("hasfocus"), 
App.game.current_droppable = e, App.game.oldIndex = null);
},
resetWidth: function(e) {
if (this.dynamicWidth) {
e = e || this.$el;
var t = _.inject(e.find(".card:visible"), function(e, t) {
return e + $(t).outerWidth(!0);
}, 0);
t = _.max([ t, parseInt(e.css("min-width"), 10) ]), e.width(t);
}
},
attachEvents: function(e) {
this.droppable && (e.is(".ui-droppable") || e.droppable({
greedy: !0,
hoverClass: this.hoverClass,
tolerance: "pointer",
drop: _.bind(function(e, t) {
App.game.current_droppable && App.game.current_droppable.onDrop.call(App.game.current_droppable, t.helper.data("card"), t.helper.data("stackView"), t.helper.data("stack"), t.helper, e);
}, this),
over: _.bind(function() {
App.game.within_droppables.push(this), this.updateCurrentDroppable();
}, this),
out: _.bind(function() {
App.game.within_droppables = _.without(App.game.within_droppables, this), this.updateCurrentDroppable(), 
-1 !== _.indexOf(this.model.allCards(), App.game.fillerCard) && App.game.fillerCard.remove();
}, this)
}).mouseout(_.bind(function() {
App.game.current_droppable && !App.game.isDragging && (App.game.within_droppables = [], 
this.updateCurrentDroppable());
}, this)), e.droppable("option", "disabled", !this.canDrop()));
},
manageVisibility: function(e) {
e = e || this.$el, this.model.get("hidden") ? e.hide() : e.show(), 0 === e.find(".card").length && (!App.game.inState("new_game") && ("function" == typeof this.showEmpty ? this.showEmpty() : this.showEmpty) || e.hide());
},
render: function(e) {
return Logger.debug(App.StackView, "Rendering view for " + this.model.get("name")), 
this.attach(), this.attachEvents(this.$el), e && this.$el.html(""), this.addCards(), 
this.manageVisibility(), this.resetWidth(), this;
}
}, {
attrs: [ "top", "left", "right", "style", "orientation", "closes", "closed", "smallFirst", "firstTop", "ordered", "showEmpty", "noReload", "selector", "parent", "draggable", "droppable", "canDrop", "hoverClass", "dynamicWidth", "withFillerCard" ],
failedImages: !1,
setBackgroundURLs: function(e) {
0 !== e.length && App.loadImage(e, function() {
$(".tablemiddle").css({
backgroundImage: "url(" + e + ")"
});
}, function() {
App.StackView.failedImages || (App.minion.getNewAd(), App.StackView.failedImages = !0);
});
},
cardClass: function(e) {
return e.isJoker() ? "joker-" + e.jokerColor() : -1 < e.val() ? App.Card.Suits[e.suit()].toLowerCase().slice(0, -1) + "-" + App.Card.Ranks[e.rank() % 13] : "";
},
positionAttrs: function(e) {
var t = App.SeatView.getSeatId(e), a = t / 3;
return {
dx: 1 === t ? 20 : undefined,
selector: "#seat-" + t + " .hand",
orientation: 2 === a ? 0 : a,
firstTop: 3 <= t && t <= 8
};
},
PlayerStackView: function(e) {
return this.extend(this.positionAttrs(e));
},
TableStack: function() {
return this.extend({
id: "table-stack",
tagName: "div",
ordered: !1,
parent: "#game-canvas",
onDrop: function(e, t, a) {
"stack_table" === this.model.get("name") && this.canPlay(e, a) && this.onClick(e, a);
},
render: function() {
return this.attach(), this.attachEvents(this.$el), this.$el.empty(), this.addCards(), 
_.each(this.model.allCards(), function(e, t) {
var a = App.game.seatViews[(App.game.read("hs.round_index") + t) % App.game.read("num_players")];
a && $("#card-" + e.cid).css({
opacity: 1,
position: "absolute",
margin: 0,
left: a.cardSlotPosition.left - App.Card.width / 2,
top: a.cardSlotPosition.top - App.Card.height / 2
});
}, this), this;
},
playCard: function(e, t, a) {
var n = App.game.seatViews[t.owner()], i = n.cardSlotPosition, r = $("#card-" + e.cid).removeAttr("id"), s = r.is(".face-up"), o = s ? r.css({
opacity: 0
}).clone().data({
stackView: this,
stack: this.model
}) : this.makeCardElem(e);
if (a) return o.attr("id", "card-" + e.cid).removeClass("selectedcard").css({
opacity: 1,
margin: 0,
left: i.left - App.Card.width / 2,
top: i.top - App.Card.height / 2
}).appendTo("#table-stack").show(), void r.remove();
(o = s ? r.css({
opacity: 0
}).clone().data({
stackView: this,
stack: this.model
}) : this.makeCardElem(e)).attr("id", "card-" + e.cid).removeClass("selectedcard").css({
margin: 0,
left: 0,
top: 0
}).appendTo("#table-stack");
var p = o.offset().left, c = o.offset().top;
o.css(s ? {
opacity: 1,
left: r.offset().left - p,
top: r.offset().top - c
} : {
opacity: 0,
left: n.domPosition.left - App.Card.width / 2,
top: n.domPosition.top - App.Card.height / 2
}), s || r.remove(), o.animate({
opacity: 1,
left: i.left - App.Card.width / 2,
top: i.top - App.Card.height / 2
}, s ? 150 : 200, function() {
r.remove();
});
}
});
}
}), App = window.App || {}, App.GameSeat = Backbone.Model.extend({
initialize: function() {
App.game.cleanBind("change:gs:players_info", [ this ], this.updatePlayer, this), 
this.get("player").bind("change", this.playerChange, this), this.bind("change:player", function() {
var e = this.changedAttributes();
if (e && e.player) {
var t = this.previousAttributes().player, a = this.get("player");
t && t.unbind("change", this.playerChange), a && (a.bind("change", this.playerChange, this), 
App.game.seatViews[this.playerIndex()].renderItems());
}
}, this), this.loadStacks();
},
canInvite: function() {
return this.get("player").isAI() && "competition" !== App.game.read("game_type") && App.current_user.isPlaying() && App.current_user.isMember();
},
canSit: function() {
if (!this.get("player").isAI() || !App.current_user.isWatcher() || App.game.isRecordedGame() || "competition" === App.game.read("game_type") && !_.include(App.game.read("only_players"), App.current_user.id) || App.game.inState("dead") || !App.game.canSit(this)) return !1;
var e = App.game.read("last_known_pos." + App.current_user.get("id")), t = App.game.read("players_info." + e, {}).id, a = !(!e || !t || t === App.current_user.id);
return void 0 === e || a || e === this.playerIndex();
},
playerIndex: function() {
return this.get("player").get("index");
},
playerChange: function() {
this.trigger("change:player"), this.change();
},
updatePlayer: function() {
var e = this.playerIndex(), t = App.game.read("players_info")[e], a = App.coplayers.ensurePlayer(t.id, _.extend({
game: App.game,
index: e
}, t)), n = this.get("player");
this.set({
player: a
}), n !== a && n.set({
index: null
}), App.game.players[e] = this.get("player"), App.game.trigger("change:players");
},
die: function() {
this.get("player") && this.get("player").die(), this.trigger("died");
},
loadStacks: function() {
this.constructor.loadStacks(this);
}
}, {
loadStacks: function(e) {
var t = e.playerIndex(), a = [ "stack_p_" + t, "stack_pv_" + t ], n = [];
_.each(a, function(e, t) {
App.game.stacks[e] || (App.game.stacks[e] = new App.CardStack({
name: e,
extendsStack: 0 === t ? null : a[0]
})), App.game.stacks[e].readCards(), n.push(App.game.stacks[e]);
});
},
attrs: [ "position", "player" ]
}), App.game.GameSeatClass = App.GameSeat, App.SeatView = Backbone.View.extend({
events: {
"click .sit-here": "sitHere",
"open .dropdown-toggle": "menuOpen"
},
initialize: function() {
this.$el.html("<div class='s-box'></div>"), this.render(), App.game.cleanBind("change:gs:timeouts", [ this ], this.renderTimer, this), 
App.game.getPlayerCircle && App.game.cleanObserve(App.game.playerCircleMonitoredEVs() || "change:gs:overall_scores change:gs:team_scores", [ this ], this.renderPlayerCircle, this), 
this.model.cleanBind("change:player", [ this ], this.renderHoldTimer, this), App.game.cleanBind("change:gs:players_away", [ this ], this.renderPlayer, this), 
this.cardSlotPosition = this.$el.next(".card-slot").position(), this.domPosition = this.$el.position();
},
die: function() {
this.playerMenu.die(), this.playerMenu = null, this.$el.html(""), this.trigger("died"), 
this.undelegateEvents();
},
renderHoldTimer: function() {
this.render(!0);
},
render: function(e) {
var t;
return e && this.$(".timer") && this.$(".timer").data("polartimer") && (this.$(".timer").polartimer("pause"), 
t = this.$(".timer").data("polartimer").resumeSeconds, this.$(".timer").polartimer("resume")), 
this.$(".s-box").html(JST["jsts/hands/seat"]({
seat: this.model,
player: this.model.get("player")
})), this.renderPlayer(), this.renderStacks(), this.renderTimer(t), this;
},
renderGameStore: function() {
App.game.isNormalGame() && (this.$el.find(".emoticon").remove(), this.$el.append(JST["jsts/hands/game_store"]({
player: this.model.get("player")
})));
},
renderItems: function() {
this.renderGameStore(), App.game.isNormalGame() && (this.$el.find(".gift-box").remove(), 
this.$el.append(JST["jsts/hands/gift_box"]({
player: this.model.get("player")
})), this.$el.append(JST["jsts/hands/emo_box"]({
player: this.model.get("player")
})));
},
renderPlayerCircle: function() {
this.$(".player .score").remove(), App.game.getPlayerCircle && this.$(".player").append(App.game.getPlayerCircle(this.model));
},
renderPlayer: function() {
if (this.$el.removeClass("current").next(".card-slot").removeClass("current"), this.$el.is(".left-lower, .bottom, .right-lower") && App.current_user.isPlaying() && (this.$el.next(".card-slot").addClass("current"), 
0 === this.model.get("position") && this.$el.addClass("current")), this.playerMenu && this.playerMenu.die(), 
this.playerMenu = new App.PlayerMenu({
model: this.model
}), this.$(".player").replaceWith(JST["jsts/hands/player_box"]({
playerMenu: this.playerMenu,
seat: this.model,
player: this.model.get("player")
})), 0 === this.model.get("position")) {
var e = App.SeatView.getSeatId(0);
App.gameActions ? (App.gameActions.setElement($("#seat-" + e + " .player-actions")), 
App.gameActions.render()) : App.gameActions = new App.GameActions({
model: App.game,
el: $("#seat-" + e + " .player-actions")
});
}
this.playerMenu.isEmpty() || (this.playerMenu.$el = this.$(".dropdown-menu.player-menu li:last"), 
this.playerMenu.render()), this.$(".player").click(function(e) {
e.preventDefault();
}), this.renderPlayerCircle();
},
renderStacks: function() {
this.constructor.renderStacks(this);
},
getStateTimeout: function(e) {
var t = App.game.read("state_tm_factor"), a = App.game.read("state_tm_constant");
return App.game.read("game_options." + (e && this.model.get("player").isAuto() ? "computer_timeout" : "play_timeout")) * t + a;
},
renderTimer: function(e) {
this.$(".timer").polartimer("destroy").polartimer({
countDown: !0,
timerSeconds: this.getStateTimeout(),
color: "#ECB000",
opacity: 1
});
var t = e || App.game.read("timeouts")[this.playerIndex()];
t && !App.game.inState("paused") ? this.activate(t) : this.deactivate();
},
activate: function(e) {
this.playerIndex() === App.current_user.get("index") && App.current_user.isPlaying() && !this.$el.is(".active") && App.sound.play("turn"), 
this.$(".timer").polartimer("start").polartimer("pause"), this.model.get("player").isAuto() && (e += this.getStateTimeout() - this.getStateTimeout(!0)), 
this.$(".timer").data("polartimer").resumeSeconds = e, this.$(".timer").polartimer("resume"), 
this.$el.addClass("active");
},
deactivate: function() {
this.$el.removeClass("active"), this.$(".timer").polartimer("reset");
},
playerIndex: function() {
return this.model.playerIndex();
},
shakeAvatar: function() {
this.$(".avatar").removeClass("tada"), setTimeout($.proxy(function() {
this.$(".avatar").addClass("animated tada");
}, this), 10);
},
menuOpen: function() {
var e = this.$(".dropdown-menu");
e.css(App.rtl ? "right" : "left", (this.$(".player").width() - e.outerWidth()) / 2);
},
sitHere: function(e) {
e.preventDefault(), App.current_user.isGuest() && App.game.read("game_options.no_guests") ? App.mustLoginLB.activate() : App.current_user.joinGame(App.game.gid, this.playerIndex());
}
}, {
renderStacks: function(e) {
var t = e.playerIndex(), a = e.model.get("position"), n = "stack_p_" + t, i = App.game.stacks[n];
App.game.stackViews[n] || (App.game.stackViews[n] = new (App.game.stackView().PlayerStackView(a))({
model: i
})), App.game.stackViews[n].render();
},
getPlacement: function(e, t) {
t = t || {};
var a = "";
switch (App.game.read("num_players")) {
case 2:
a = [ "bottom", "top" ][e];
break;

case 3:
a = [ "bottom", "right", "left" ][e];
break;

case 4:
a = [ "bottom", "right", "top", "left" ][e];
break;

case 5:
case 6:
a = [ "bottom", "right-lower", "right-upper", "top", "left-upper", "left-lower" ][e];
}
return t.basic && (a = a.split("-")[0]), t.inverse && (a = {
top: "bottom",
bottom: "top",
right: "left",
left: "right"
}[a]), a;
},
getSeatId: function(e) {
var t = [ "bottom-left", "bottom", "bottom-right", "right-lower", "right", "right-upper", "top-right", "top", "top-left", "left-upper", "left", "left-lower" ], a = this.getPlacement(e);
return _.indexOf(t, a);
}
}), App.game.SeatViewClass = App.SeatView, App = window.App || {}, App.PlayerMenu = App.ListView.extend({
items: [ {
id: "addFriend",
name: "Add Friend",
icon: '<i class="fa fa-star"></i>',
visible: function() {
return !this.player().isMe() && this.player().isMember() && App.current_user.isMember() && 0 === App.coplayers.relation(this.player().id);
},
onClick: function() {
this.player().changeRelation(3);
}
}, {
id: "deleteFriend",
name: "Delete Friend",
icon: '<i class="fa fa-star-o"></i>',
visible: function() {
return this.player().isMember() && App.current_user.isMember() && 1 === App.coplayers.relation(this.player().id);
},
onClick: function() {
App.confirm(G._("Are you sure?"), function() {
this.player().changeRelation(0);
}, this);
}
}, {
id: "cancelRequest",
name: "Cancel Request",
icon: '<i class="fa fa-star-o"></i>',
visible: function() {
return this.player().isMember() && App.current_user.isMember() && 3 === App.coplayers.relation(this.player().id);
},
onClick: function() {
this.player().changeRelation(0);
}
}, {
id: "acceptRequest",
name: "Accept Request",
icon: '<i class="fa fa-star"></i>',
visible: function() {
return this.player().isMember() && App.current_user.isMember() && 4 === App.coplayers.relation(this.player().id);
},
onClick: function() {
this.player().changeRelation(1);
}
}, {
id: "rejectRequest",
name: "Reject Request",
icon: '<i class="fa fa-star-o"></i>',
visible: function() {
return this.player().isMember() && App.current_user.isMember() && 4 === App.coplayers.relation(this.player().id);
},
onClick: function() {
this.player().changeRelation(0);
}
}, {
id: "viewProfile",
name: "View Profile",
visible: function() {
return !this.player().isAI() && !this.player().isGuest();
},
onClick: function() {
App.ProfilesViewer.getProfile(this.player().get("id"));
}
}, {
id: "sendGift",
name: "Send a Gift",
visible: function() {
return !1;
},
onClick: function() {
App.game.goods.openStore(this.player().get("id"));
}
}, {
id: "buyFromStore",
name: "Open Store",
visible: function() {
return !1;
},
onClick: function() {
App.game.goods.openStore();
}
}, {
id: "playerSetAway",
name: "Away",
bashaOnly: !0,
visible: function() {
return this.player().isMe() && "competition" !== App.game.read("game_type") && !App.game.inState("new_game") && !App.game.isChallengeGame();
},
onClick: function() {
App.comm.sendGame("set_away");
}
}, {
id: "kickOut",
name: "Kick Out",
visible: function() {
return App.current_user.isPlaying() && App.game.iAmOriginalCreator() && App.current_user.isBasha() && !this.player().isAI() && !this.player().isMe();
},
onClick: function() {
App.game.read("game_options.no_kick_or_reseat") ? App.Lightbox.error(G._("The options of this game do not allow kicking players out")) : App.confirm(G._("Are you sure? This player will be banned from this table."), function() {
App.comm.sendGame("kick", {
index: this.player().get("index")
});
}, this);
}
}, {
id: "complain",
name: "Complain",
visible: function() {
return !App.current_user.isWatcher() && !App.current_user.isGuest() && !this.player().isAI() && !this.player().isMe() && !App.current_user.isGameAdmin() && App.game.isCompetitionGame();
},
onClick: function() {
App.flagPlayerLB.activate({
userIndex: this.player().get("index")
});
}
}, {
id: "adminKickPlayer",
name: "Kick Out",
visible: function() {
return App.current_user.hasAdminFeature("kick") && !this.player().isMe() && !this.player().isAI() && App.current_user.isGameAdmin() && 2 !== App.game.read("num_players") && !App.game.read("game_options.no_kick_or_reseat") && !App.game.isRecordedGame();
},
onClick: function() {
App.confirm(G._("Are you sure? This player will be banned from this table."), function() {
App.game.isCompetitionGame() && $.ajax({
url: "/" + G.lang() + "/competitions/" + App.game.read("competition_id") + "/competition_users/kick",
type: "POST",
data: {
id: this.player().get("id")
},
dataType: "text"
});
}, this);
}
} ],
initialize: function() {
App.ListView.prototype.initialize.apply(this, arguments), this.model.cleanBind("change:player", [ this ], this.render, this), 
App.game.cleanBind("change:gs:state", [ this ], this.render, this);
},
player: function() {
return this.model.get("player");
},
makeItem: function(e) {
return _.string.sprintf('<a href="#" data-item="%s">%s %s</a>', e.id, this.makeIcon(e), G._(e.name));
}
}), App = window.App || {}, App.ScoresTab = Backbone.View.extend({
template: JST["jsts/hands/scores_tab"],
initialize: function() {
this.model.on("started", this.render, this), App.game.cleanObserve("change:gs:chips change:gs:state change:gs:team_scores change:gs:overall_scores", [ this ], this.render, this);
},
render: function() {
if (!App.game.inState([ "new_game", "game_ready" ])) {
var e = this.model.read("track_scores") || [];
this.$el.html(this.template({
teams: this.model.scoreTeams(),
scores: e
}));
}
return this;
}
}, {
gameScore: function(e) {
return App.game.scores()[e];
},
gameWinner: function(e) {
if (App.game.scoresTabExtension && _.isFunction(App.game.scoresTabExtension.gameWinner)) return App.game.scoresTabExtension.gameWinner.apply(this, arguments);
var t = App.game.scores();
return t[e] === _.max(t) && _.without(t, t[e]).length === t.length - 1;
},
preGameRound: function(e, t) {
return (App.game.scoresTabExtension.preGameRound || $.noop).apply(this, arguments);
},
roundSummary: function(e, t) {
return (App.game.scoresTabExtension.roundSummary || $.noop).apply(this, arguments);
},
roundDetails: function(e, t) {
return (App.game.scoresTabExtension.roundDetails || $.noop).apply(this, arguments);
},
roundHeader: function(e, t) {
return (App.game.scoresTabExtension.roundHeader || $.noop).apply(this, arguments);
},
roundScore: function(e, t, a) {
return _.isFunction(App.game.scoresTabExtension.roundScore) ? App.game.scoresTabExtension.roundScore.apply(this, arguments) : e[0][a];
},
roundWinner: function(e, t, a) {
return _.isFunction(App.game.scoresTabExtension.roundWinner) ? App.game.scoresTabExtension.roundWinner.apply(this, arguments) : e[0][a] === _.max(e[0]);
},
setup: function(e) {
App.scoresTab = new App.ScoresTab({
model: App.game,
el: e
});
}
}), App = window.App || {}, App.LastRoundTab = Backbone.View.extend({
template: JST["jsts/games/last_round"],
initialize: function() {
App.game.cleanBind("change:gs:hs:last_round", [ this ], this.render, this);
},
render: function() {
return this.$el.html(this.template()), this;
}
}, {
positions: function(e) {
switch (e) {
case 2:
return {
left: [ 0, 0 ],
top: [ 45, -45 ]
};

case 4:
return {
left: [ 0, 75, 0, -75 ],
top: [ 45, 0, -45, 0 ]
};

case 6:
return {
left: [ 0, 75, 75, 0, -75, -75 ],
top: [ 45, 45, -45, -45, -45, 45 ]
};
}
},
setup: function(e) {
App.lastRoundTab = new App.LastRoundTab({
model: App.game,
el: e
});
}
}), function() {
App = window.App || {};
var e = App.Lightbox.extend({
inGame: !0,
events: {
activated: "showBackdrop",
deactivated: "hideBackdrop",
"click [data-action]": "runAction"
},
showBackdrop: function() {
var e = $("#game-body-backdrop"), t = e.data("modals") || [];
t.push(this.name()), e.data("modals", t), e.show();
},
hideBackdrop: function() {
var e = $("#game-body-backdrop"), t = e.data("modals") || [];
t = _.without(t, this.name()), e.data("modals", t), 0 === t.length && e.hide();
}
}), t = e.extend({
alwaysOnTop: !0,
title: G._("Game Over"),
template: JST["jsts/games/game_dead"],
footer: [ {
type: "a",
name: "Back to games",
klass: "btn-primary",
action: "backToGames"
} ],
backToGames: function() {
var e = "/" + G.lang() + "/games/" + App.gameList.get("game_module") || "tarneeb";
App.gamesRouter.navigate(e, {
trigger: !0
});
},
visible: function() {
return this.model.inState("dead");
}
}, {
monitoredEvents: [ "change:gs:state" ]
});
App.gameDeadLB = new t({
model: App.game
});
var a = e.extend({
optional: !0,
form: !0,
klass: "form-inline",
title: G._("Complain"),
template: JST["jsts/games/flag_player"],
footer: [ {
type: "a",
name: "Cancel",
action: "cancel"
}, {
type: "button",
name: "Complain",
action: "complain"
} ],
events: {
"click [data-action]": "runAction",
"keyup textarea": "checkDescriptionLimit"
},
checkDescriptionLimit: function() {
var e = this.$(".control-group textarea").val().trim(), t = _.max(e.replace(/\n/g, " ").split(" "), function(e) {
return e.length;
});
this.$("button.btn-primary").attr("disabled", e.length < 30 || 20 < t.length);
},
activate: function() {
App.Lightbox.prototype.activate.apply(this, arguments), this.checkDescriptionLimit();
},
complain: function() {
var e = {
type: "cheating",
target_id: App.game.read("players_info." + this.params.userIndex).id,
description: this.$("textArea").val(),
game_id: App.game.read("id"),
position: App.getTime() - App.game.read("created_at")
};
$.ajax({
url: "/" + G.lang() + "/competitions/" + App.game.read("competition_id") + "/competition_users/complain",
type: "POST",
data: {
complaint: e
},
dataType: "JSON",
success: function() {
App.Lightbox.alert(G._("comp_complaint_success"), {
title: G._("Request Sent")
});
},
error: function(e) {
var t = JSON.parse(e.responseText);
t.errors && t.errors.identifier && App.Lightbox.error(G._("comp_complaint.already_complained"));
}
}), this.deactivate();
}
});
App.flagPlayerLB = new a({
model: App.game
});
var n = e.extend({
optional: !0,
form: !0,
klass: "form-horizontal blocks-for-errors",
title: G._("Change game parameters"),
template: JST["jsts/games/change_params"],
footer: [ {
type: "a",
name: "Cancel",
action: "cancel"
}, {
type: "button",
name: "Submit",
action: "submitChange"
} ],
events: {
activated: "activated",
deactivated: "hideBackdrop",
"click [data-action]": "runAction",
"click #paramPrivate": "paramPrivate"
},
activated: function() {
this.showBackdrop(), this.$("form").validate({
rules: {
paramPassword: {
required: !0
}
},
messages: {
paramPassword: {
required: G._("Cannot be empty")
}
}
});
},
submitChange: function(e) {
this.$("form").valid() && (App.comm.sendGame("change_params", {
name: this.$("#paramName").val(),
password: this.$("#paramPassword").value = 1,
min_level: parseInt(this.$("#paramLevel").val()),
play_timeout: parseInt(this.$(".paramTimer:checked").val()) || App.game.read("game_options.play_timeout")
}), this.deactivate(), this.$("#paramPassword").val() ? ($("#symposium-main #tab-chat .simple-chat").hide(), 
$("#symposium-main #tab-chat .module-footer").show()) : ($("#symposium-main #tab-chat .simple-chat").show(), 
$("#symposium-main #tab-chat .module-footer").hide())), e.preventDefault();
},
paramPrivate: function() {
this.$("#paramPassword").attr("disabled", !this.$("#paramPrivate")[0].checked), 
this.$("#paramPassword").val(""), !$("#paramPrivate")[0].checked && this.$("form").valid() && this.$("form .error").removeClass("error");
}
});
App.changeParamsLB = new n({
model: App.game
});
var i = App.Lightbox.extend({
title: G._("This is a password-protected game"),
inGame: !0,
optional: !0,
form: !0,
klass: "form-horizontal",
template: JST["jsts/games/password"],
footer: [ {
type: "a",
name: "Cancel",
action: "cancel"
}, {
type: "button",
name: "Join",
action: "join"
} ],
join: function(e) {
App.current_user.isGuest() ? App.mustLoginLB.activate() : App.comm.enqueue("engine", "join_game", [ this.model.gid, $("#joinPassword").val(), this.params.index, App.whiteLabel.id, {} ]), 
e.preventDefault();
}
});
App.passwordLB = new i({
model: App.game
});
var r = App.Lightbox.extend({
template: JST["jsts/competitions/auto_start"],
inGame: !0,
visible: function() {
return "competition" === this.model.read("game_type") && this.model.inState("new_game");
}
}, {
monitoredEvents: [ "change:gs:state" ]
});
App.competitionAutoStart = new r({
model: App.game
});
var s = e.extend({
alwaysOnTop: !0,
template: JST["jsts/games/player_away"],
footer: [ {
type: "button",
name: "Come Back",
action: "unset"
} ],
visible: function() {
return !App.current_user.isWatcher() && App.game.read("players_away", {})[App.current_user.get("index")] && !App.game.inState([ "graceful_end", "after_hands" ]);
},
unset: function() {
App.comm.sendGame("unset_away"), this.deactivate();
}
}, {
monitoredEvents: [ "change:gs:players_away change:gs:state" ]
});
App.playerAwayLB = new s({
model: App.game
});
var o = e.extend({
alwaysOnTop: !0,
template: JST["jsts/games/player_idle"],
footer: [ {
type: "button",
name: "Come Back",
action: "unset"
} ],
visible: function() {
return !App.current_user.isWatcher() && App.game.read("players_idle", {})[App.current_user.get("index")] && !App.game.inState([ "graceful_end", "after_hands" ]);
},
unset: function() {
App.comm.sendGame("unset_idle"), this.deactivate();
}
}, {
monitoredEvents: [ "change:gs:players_idle change:gs:state" ]
});
App.PlayerIdleLB = new o({
model: App.game
});
var p = App.Lightbox.extend({
inGame: !0,
template: JST["jsts/games/game_paused"],
events: {
activated: "startCounter"
},
visible: function() {
return App.game.inState("paused");
},
startCounter: function() {
var e = parseInt(App.game.read("game_options.pause_until") - App.getTime(), 10);
App.JawakerCounters["#pauseUntilCounter"] = e, App.startCounters();
}
}, {
monitoredEvents: [ "change:gs:state" ]
});
App.gamePausedLB = new p({
model: App.game
});
var c = e.extend({
optional: !0,
form: !0,
klass: "form-horizontal",
title: G._("Pause Game"),
template: JST["jsts/games/pause_game"],
footer: [ {
type: "button",
name: "Pause",
action: "pause"
} ],
pause: function() {
App.comm.sendGame("pause", {
pause_duration: $("#pauseDurationSelect").val()
}), this.deactivate();
}
});
App.pauseGameLB = new c({
model: App.game
}), App.UIManager = {
buttonVisibility: function(e, t) {
App.current_user.isWatcher() || _.invoke([ $("#" + e) ], t ? "show" : "hide");
}
}, $(function() {
var e = App.game.module, t = App.Lightbox.extend({
optional: !0,
backdrop: !0,
alwaysOnTop: !0,
title: G._(e),
template: JST["jsts/games/take_guide"],
footer: [ {
type: "a",
name: "Later",
action: "cancel"
}, {
type: "button",
name: "View Guide",
action: "take",
klass: "game-guide-link",
rel: e
} ],
take: function() {
this.deactivate();
},
visible: function() {
return parseInt(App.readCookie("new_user"), 10) === App.current_user.id && 0 < App.game.read("track_scores", []).length && App.current_user.isPlaying();
},
activate: function() {
App.Lightbox.prototype.activate.apply(this, arguments), this.$el.on("deactivated", function() {
App.eraseCookie("new_user");
});
}
}, {
monitoredEvents: [ "change:gs:state" ]
});
App.takeGuideLB = new t({
model: App.game
});
});
}(), App.game.bind("change:gs:state", function() {
if (App.game.inState("in_hand") && App.sound.play("in_hand"), App.game.inState("after_hands")) {
var e = App.game.isChallengeGame() ? App.ChallengeSummaryView : App.GameSummaryView;
App.gameSummaryView = new e({
el: $("#game-summary")
}).render();
} else App.gameSummaryView && App.gameSummaryView.unrender();
}), App.game.bind("change:gs:players_info", function() {
var e = _.compact(_.pluck(App.game.readOld("players_info"), "id")), t = _.compact(_.pluck(App.game.read("players_info"), "id"));
_.without(t, e).length && App.sound.play("new_player"), _.without(e, t).length && App.sound.play("leave_game");
}), App.game.bind("change:gs:game_table", function() {
var e = !1, t = App.game.read("game_table")[0], a = App.ItemsManager.getItem(t);
void 0 !== a && (e = a.supplementary2_avatar), e ? $("<img/>").attr("src", e).on("load", function() {
$(this).remove(), $("#game-table-border").removeClass("default-table"), $("#game-table-border").css("background-image", "url(" + e + ")");
}) : ($("#game-table-border").addClass("default-table"), $("#game-table-border").css("background-image", ""));
}), App.game.vaporize = function(e, t, a) {
a = a || "black";
var n = App.SeatView.getSeatId(App.game.players[e].position());
$("#seat-" + n + " .avatar").vaporize(JST["jsts/templates/vapor"]({
content: t,
bg_color: a
}));
}, App.clearCardIcons = function(e) {
var t = e.get("player").get("index");
return $("#player-" + t).closest(".seat").find(".card-icons").empty();
}, App.addCardIcon = function(e, t, a, n) {
var i = e.get("player").get("index"), r = $(JST["jsts/games/playing_card"]({
card: new App.Card()
})).addClass("face-up");
r.attr("rel", "tooltip").attr("data-placement", App.SeatView.getPlacement(e.get("position"), {
basic: !0
}));
var s = $("#player-" + i).closest(".seat"), o = s.find(".card-icons");
r.attr("title", a), s.is("#seat-1, #seat-9, #seat-11") && (r.css("z-index", 20 - o.children().length), 
t = t.replace(/\b(heart-|spade-|diamond-|club-)/g, "card-icon-$1")), r.addClass(t);
var p = r.find(".face");
return _.each(n, function(e) {
_.isObject(e) ? p.append('<i class="' + e.klass + '" style="' + e.style + '"></i>') : p.append("<span>" + e + "</span>");
}), o.append(r), r;
}, App.powerUpsHandler = {
bomb: {
active: function() {
return !App.game.inState([ "graceful_end", "after_hands" ]) && App.game.read("challenge_options.powerups");
},
trigger: function(e, t) {
App.comm.enqueue("engine", "apply_power_up", [ App.game.gid, e, {
target_index: t
} ]);
}
},
"switch": {
active: function() {
return !App.game.inState([ "graceful_end", "after_hands" ]) && App.game.read("challenge_options.powerups");
},
trigger: function(t, a) {
var n = App.game.stackViews["stack_p_" + App.current_user.get("index")], e = G._("power_up_switch_lb_content", {
name: App.game.read("players_info." + a).login
});
n.selectNumCards = 3, App.Lightbox.activate({
inGame: !0,
form: !0,
klass: "form-horizontal",
title: G._("power_up.switch_lb_title"),
content: function() {
return e;
},
footer: [ {
type: "a",
name: "Cancel",
action: "cancel"
}, {
type: "button",
name: "Switch",
action: "switch"
} ],
"switch": function() {
var e = n.selectedCards();
e.length && App.comm.enqueue("engine", "apply_power_up", [ App.game.gid, t, {
target_index: a,
cards: e
} ]), this.deactivate();
},
deactivate: function() {
App.Lightbox.prototype.deactivate.apply(this, arguments), n.clearSelectedCards();
}
});
}
},
rewind: {
active: function() {
return App.game.inState("in_hand") && 4 <= App.game.read("hs.turns_total") && App.game.read("challenge_options.powerups");
},
trigger: function(e) {
App.comm.enqueue("engine", "apply_power_up", [ App.game.gid, e ]);
}
},
counter: {
active: function() {
return App.game.inState("in_hand") && 4 <= App.game.read("hs.turns_total") && !App.game.read("current_hand").match(/Trix$/) && !App.game.read("current_hand").match(/Hand(game|Saudi)$/) && App.game.read("challenge_options.powerups");
},
trigger: function(e) {
App.comm.enqueue("engine", "apply_power_up", [ App.game.gid, e ]);
}
}
}, $(function() {
App.comm.registerCallback("cardsCount", function(e) {
App.Lightbox.activate({
inGame: !0,
form: !0,
backdrop: !0,
klass: "form-horizontal",
title: G._("Cards Counter"),
fireCards: _.inject(e, function(e, t) {
return e[t] = !0, e;
}, {}),
template: JST["jsts/games/cards_counter"],
footer: [ {
type: "a",
name: "Close",
action: "cancel"
} ]
});
});
}), App.PowerUp = Backbone.Model.extend({
imageLink: function() {
return "https://s3.amazonaws.com/jawaker" + ("production" === Consts.env ? "" : "_dev") + "/" + this.get("creative");
},
apply: function(e) {
var t = App.game.read("pu_counts"), a = !0;
for (var n in t) for (var i in n) t[n][i] == this.get("identifier") && (a = !1);
a ? App.powerUpsHandler[this.get("identifier")].trigger(this.id, e) : App.Lightbox.error("You can use only one powerup per challenge");
},
getMore: function() {
var e = this, t = 5 * e.get("price");
App.Lightbox.activate({
optional: !0,
title: G._("buy_pu_lb.title"),
content: function() {
return G._("buy_pu_lb.content", {
name: G._("power_up." + e.get("identifier")),
price: t
});
},
footer: [ {
type: "a",
name: "Cancel",
action: "cancel"
}, {
type: "button",
name: "Buy",
action: "buy"
} ],
buy: function() {
this.deactivate(), t > App.current_user.get("game_tokens") ? App.notEnoughTokens.activate() : App.comm.enqueue("goods", "buy_item", [ 0, App.current_user.id, e.id, {
quantity: 5
} ]);
}
});
},
isActive: function() {
return App.powerUpsHandler[this.get("identifier")].active() && this.notUsedOn().length;
},
notUsedOn: function() {
var t = this.get("identifier");
return _.select(_.range(1, App.game.read("num_players")), function(e) {
return !_.include(App.game.read("pu_counts." + e, []), t);
});
}
}), App.PowerUpsTab = Backbone.View.extend({
template: JST["jsts/games/pu_tab"],
powerUps: new (Backbone.Collection.extend({
model: App.PowerUp
}))(),
events: {
"click .power-up": "puClick"
},
initialize: function() {
App.comm.registerCallback("power_ups", _.bind(function(e) {
_.each(e, function(e) {
"Rewind" !== e.name && (this.powerUps.get(e.id) ? this.powerUps.get(e.id).set(e) : this.powerUps.add(e));
}, this), this.render();
}, this)), App.comm.registerCallback("power_up_used", _.bind(function(e) {
var t = this.powerUps.get(e);
t.set("count", t.get("count") - 1), this.render();
}, this)), App.comm.enqueue("goods", "power_ups", []), App.game.cleanBind("change:gs:state change:gs:hs:turns_total", [ this ], this.render, this), 
$("#game-body").on("click", _.bind(this.selectModeOff, this));
},
render: function() {
return this.$el.html(this.template({
view: this
})), this;
},
puClick: function(e) {
e.preventDefault();
var t = $(e.currentTarget), a = !t.hasClass("selected");
if (this.selectModeOff(), a) {
if (this.selected = this.powerUps.find(function(e) {
return e.get("identifier") === t.data("identifier");
}), !this.selected.isActive()) return;
if (this.selected.get("count") <= 0) return void this.selected.getMore();
"players" === this.selected.get("acts_on") ? (t.addClass("selected"), this.highlightPlayers(), 
this.createDraggable()) : this.selected.apply();
}
},
tableMsg: function(e) {
App.Lightbox.activate({
name: function() {
return "table-msg";
},
inGame: !0,
content: function() {
return G._(e);
},
width: 400
});
},
highlightPlayers: function() {
this.onPlayerClick = _.bind(function(e) {
var t = $(e.currentTarget).attr("id").split(/-/)[1];
this.selected.apply(t);
}, this);
this.selected.get("identifier");
var e = this.selected.notUsedOn();
this.$players = $(_.map(e, function(e) {
return "#player-" + e;
}).join(",")), this.$players.addClass("power-up-highlight").on("click", this.onPlayerClick), 
$("#game-body-overlay").show(), this.tableMsg(G._("Click on a highlighted player"));
},
selectModeOff: function() {
this.selected && (this.$(".power-up").removeClass("selected"), this.$players && this.$players.removeClass("power-up-highlight").off("click", this.onPlayerClick), 
App.Lightbox.deactivate("table-msg"), $("#game-body-overlay").hide(), this.$draggedPu && this.$draggedPu.remove(), 
_.each(this.cbs, function(e, t) {
$("#game-body").off(t, e);
}), this.selected = null);
},
createDraggable: function() {
this.$draggedPu = $("<img class='dragged-pu' src='" + this.selected.imageLink() + "'/>"), 
$("body").append(this.$draggedPu), this.cbs = {
mousemove: _.bind(function(e) {
this.$draggedPu.css({
left: e.pageX + 5,
top: e.pageY + 5
});
}, this),
mouseenter: _.bind(function() {
this.$draggedPu.show();
}, this),
mouseleave: _.bind(function() {
this.$draggedPu.hide();
}, this)
}, _.each(this.cbs, function(e, t) {
$("#game-body").on(t, e);
});
}
}), App = window.App || {}, App.minion = {
ad: {},
adAlreadyClicked: !1,
getNewAd: function() {
App.whiteLabel.iframe;
},
reportAdClick: function() {
var e = this.ad.cid;
null === e || this.adAlreadyClicked || (App.comm.enqueue("minion", "count_click", [ App.game.gid, e, window.location.host ]), 
this.adAlreadyClicked = !0);
},
placeAd: function(e, a) {
if (0 !== e.length && (this.ad = a, this.adAlreadyClicked = !1, App.StackView.setBackgroundURLs(e, a), 
!App.whiteLabel.options.no_ads && !_.isEmpty(a) && !_.isEmpty(a.ar_url))) {
var n = G.lang();
_.each([ "title", "content", "url" ], function(t) {
a[t] = a[n + "_" + t] ? a[n + "_" + t] : a[_.find(_.keys(a), function(e) {
return e.match("^\\w{2}_" + t + "$");
})];
});
}
},
doAdClick: function() {
return this.ad.url && (this.reportAdClick(), window.open(this.ad.url)), !1;
}
}, App.comm.registerCallback("placeAd", function(e, t, a) {
e === App.game.gid && App.minion.placeAd(t, JSON.parse(a));
}), App.recordingManager = function() {
var r, s, o = null;
return {
position: null,
paused: !0,
recording: function() {
return r;
},
currTime: 0,
maxPosition: null,
paramPosition: 0,
setup: function(e) {
App.comm.registerCallback("setRecordingGS", function(e, t) {
App.game.setGS(t);
}), $.ajax({
url: "https://s3.eu-central-1.amazonaws.com/jawaker-recordings/recordings/" + ("production" === Consts.env ? "" : Consts.env + "/") + App.game.gid + ".js",
dataType: "jsonp"
}), setTimeout(this.checkLoaded, 6e3), this.controlsView = new App.RecordingControlsView({
el: $("#recording-controls")
}), $("#game-body").addClass("recording"), this.paramPosition = e;
},
setPosition: function(e) {
var t, a, n = 1, i = r.length;
for (o && clearTimeout(o), (a = App.symposium.get("rooms").get("g_" + App.game.gid)) && a.clear(), 
this.runCommandAt(0); n < i && !((t = JSON.parse(r[n]))[1] > s + 1e3 * e); ) "engine" === t[0] ? "runEngineCommands" === t[2][0] && _.each(t[2][2].cmds, function(e) {
"change" === e[0] && App.game.updateKey(e[1], e[2]);
}) : this.runCommandAt(n), n += 1;
this.position = n - 1, this.currTime = e, App.game.firstLoad ? App.game.start() : App.game.reset(), 
this.paused ? this.removeTimers() : this.play();
},
runCommandAt: function(e) {
var t = JSON.parse(r[e]), a = JSON.stringify(t[2]);
return App.comm.handleResponse(a), t;
},
advance: function() {
this.position += 1;
var e = this.runCommandAt(this.position), t = null;
this.position < r.length - 1 && (t = JSON.parse(r[this.position + 1])[1] - e[1]) < 50 && (t = 50), 
t && (o && clearTimeout(o), o = setTimeout(_.bind(this.advance, this), t)), this.currTime = parseInt((e[1] - s) / 1e3, 10);
},
removeTimers: function() {
_.invoke(App.game.seatViews, "deactivate");
},
pause: function() {
this.paused = !0, this.removeTimers(), clearTimeout(o);
},
play: function() {
this.paused = !1, this.advance();
},
setRecording: function(e, t) {
var a;
r = t, App.game.get("recording_skip") ? (a = _.indexOf(r, _.find(r, function(e) {
return e.match(/\["change",\["state"\],(?!"new_game")/);
})), a = _.max([ a - 1, 0 ]), s = 1e3 * parseInt(JSON.parse(r[a])[1] / 1e3, 10)) : (s = 1e3 * parseInt(JSON.parse(r[0])[1] / 1e3, 10), 
a = 0), this.maxPosition = parseInt((JSON.parse(r[r.length - 1])[1] - s) / 1e3, 10), 
this.setPosition(a), this.controlsView.render();
},
checkLoaded: function() {
r || App.Lightbox.alert(G._("rec_load_err"));
},
ended: function() {
return this.currTime >= this.maxPosition;
}
};
}(), App.RecordingControlsView = Backbone.View.extend({
events: {
"click .btn-play": "playPause",
"click .btn-complain": "submitComplaint"
},
playPause: function(e) {
e.preventDefault(), this.$(".btn-complain").removeAttr("disabled"), App.recordingManager.ended() && (App.recordingManager.setPosition(0), 
this.$(".slider .ui-slider").rtl_slider("value", 0)), App.recordingManager[App.recordingManager.paused ? "play" : "pause"].apply(App.recordingManager), 
this.setIcon(App.recordingManager.paused ? "play" : "pause");
},
setIcon: function(e) {
this.$(".btn-play").html("<i class='fa fa-" + e + "'></i>");
},
renderTime: function(e) {
var t = App.recordingManager.maxPosition;
this.$ve.html(_.string.sprintf("%d:%02d", parseInt(e / 60, 10), e % 60) + " / " + _.string.sprintf("%d:%02d", parseInt(t / 60, 10), t % 60));
},
submitComplaint: function(e) {
e.preventDefault(), App.recordingManager.pause.apply(App.recordingManager), this.setIcon("play"), 
App.Lightbox.activate({
optional: !0,
backdrop: !0,
template: JST["jsts/competitions/complain"],
title: G._("Submit a Complaint"),
form: !0,
klass: "form-horizontal new-competition-form",
footer: [ {
type: "a",
name: "Cancel",
action: "cancel"
}, {
type: "button",
name: "Send",
action: "create"
} ],
events: {
"click [data-action]": "runAction",
"change select": "enableSend",
"keyup textarea": "checkDescriptionLimit"
},
checkDescriptionLimit: function() {
var e = this.$(".control-group textarea").val().trim(), t = _.max(e.replace(/\n/g, " ").split(" "), function(e) {
return e.length;
});
this.$("button.btn-primary").attr("disabled", e.length < 30 || 20 < t.length);
},
enableSend: function() {
var e = this.$("select[name='complaint[type]']").val();
this.$(".control-group[data-type]").hide(), this.$(".control-group[data-type] select").attr("disabled", !0), 
e && 0 < e.trim().length && (this.$(".control-group[data-type='" + e + "']").show(), 
this.$(".control-group[data-type='" + e + "'] select").attr("disabled", !1));
var t = this.$("select:enabled[name='complaint[target_id]']").val();
t && 0 < t.trim().length && e && 0 < e.trim().length ? this.$(".control-group[data-type='description']").show() : this.$(".control-group[data-type='description']").hide();
var a = _.any(this.$(".control-group:visible select"), function(e) {
return 0 === $(e).val().trim().length;
});
this.$("button.btn-primary").attr("disabled", a);
var n = this.$(".control-group textarea").val().trim();
this.$("button.btn-primary").attr("disabled", n.length < 30);
},
activate: function() {
App.Lightbox.prototype.activate.apply(this, arguments), this.enableSend();
},
create: function() {
this.$("button.btn-primary").addClass("disabled").append("<img class='loadingGif' src='/images/loading.gif' />");
App.recordingManager.maxPosition;
var e = App.recordingManager.currTime;
this.$("form").append("<input type='hidden' name='complaint[position]' value='" + e + "'>"), 
this.$("form").append("<input type='hidden' name='complaint[game_id]' value='" + App.game.read("id") + "'>");
var t = this;
$.ajax({
url: "/" + G.lang() + "/competitions/" + App.current_competition.id + "/competition_users/complain",
type: "POST",
data: this.$("form").serialize(),
dataType: "json",
success: function() {
t.deactivate(), window.location.reload();
},
error: function() {
App.Lightbox.alert(G._("Please fill the form correctly")), t.$("button.btn-primary").removeClass("disabled").find(".loadingGif").remove();
}
});
}
});
},
render: function() {
App.current_comp_user && App.current_competition && "on_hold" === App.current_competition.get("state") && _.contains(Consts.comp_user_state_perms.complain, App.current_comp_user.status) && (this.$(".btn-complain").removeClass("hidden"), 
0 < App.recordingManager.paramPosition && this.$(".btn-complain").removeAttr("disabled")), 
this.$ve = this.$(".slider .slider-value span");
var t = this.$(".slider .ui-slider");
t.rtl_slider({
rtl: "ar" === G.lang(),
animate: !0,
max: App.recordingManager.maxPosition,
slide: _.bind(function(e, t) {
this.renderTime(Math.abs(t.value));
}, this),
change: _.debounce(_.bind(function(e, t) {
var a = Math.abs(t.value);
e.originalEvent && (App.recordingManager.setPosition(a), this.$(".btn-complain").removeAttr("disabled")), 
this.renderTime(a), this.setIcon(App.recordingManager.paused ? "play" : "pause");
}, this), 250)
}), this.renderTime(App.recordingManager.paramPosition), App.recordingManager.setPosition(App.recordingManager.paramPosition), 
this.$(".slider .ui-slider").rtl_slider("value", ("en" === G.lang() ? 1 : -1) * App.recordingManager.paramPosition), 
setInterval(_.bind(function() {
var e = Math.abs(t.rtl_slider("value"));
App.recordingManager.paused || t.rtl_slider("value", ("en" === G.lang() ? 1 : -1) * (e + 1)), 
App.recordingManager.ended() && (App.recordingManager.pause(), this.setIcon("undo"));
}, this), 1e3);
}
}), App.Challenge = {}, App.Challenge.Model = Backbone.Model.extend({
defaults: {
game_module: "Tarneeb",
num_rounds: 1,
powerups: !1
},
urlRoot: function() {
return "/" + G.lang() + "/challenges";
},
me: function() {
var e = this.get("user").id === App.current_user.id ? this.get("user") : this.get("opponent");
return new App.User(e);
},
otherPlayer: function() {
var e = this.get("user").id === App.current_user.id ? this.get("opponent") : this.get("user");
return new App.User(e);
},
turnID: function() {
return 0 === this.get("turn") ? this.get("user").id : this.get("opponent").id;
},
myTurn: function() {
return this.turnID() === this.me().id;
},
play: function() {
App.comm.registerCallback("redirectToGame", function(e) {
window.location = "/" + G.lang() + "/games/" + e;
}), App.comm.enqueue("engine", "play_challenge", [ 0, this.id, {} ]);
},
otherFromFB: function() {
return this.otherPlayer().get("fb_uid");
},
sendFBRequest: function(t) {
var e = {
url: "/" + G.lang() + "/challenges/" + this.get("game_module") + "?id=" + this.id
};
FB.ui({
method: "apprequests",
message: G._("challenge_request_msg", {
gm: G._(this.get("game_module"))
}),
data: JSON.stringify(e),
to: this.otherPlayer().get("fb_uid")
}, function(e) {
_.isFunction(t) && t.call(e);
});
},
upToDate: function() {
if (!App.game) return !0;
var e = this.get("curr_round"), t = this.get("last_round");
return !!e && (1 === e.length && e[0].game_id === App.game.gid || 0 === e.length && t && _.include([ t[0].game_id, t[1].game_id ], App.game.gid));
},
myResult: function(e) {
return e[0].player_id === App.current_user.id ? e[0] : e[1];
},
otherResult: function(e) {
return e[0].player_id === App.current_user.id ? e[1] : e[0];
},
whoWon: function(e) {
if (!this.otherResult(e)) return !1;
var t = this.myResult(e).score, a = this.otherResult(e).score;
return a < t ? 0 : t < a && 1;
},
isTie: function(e) {
return !!this.otherResult(e) && (this.myResult(e).score === this.otherResult(e).score && this.myResult(e).time_score === this.otherResult(e).time_score);
},
iWon: function(e) {
return 2 === e.length && (this.myResult(e).score > this.otherResult(e).score || !(this.myResult(e).score < this.otherResult(e).score) && this.myResult(e).time_score > this.otherResult(e).time_score);
},
otherWon: function(e) {
return !(this.iWon(e) || this.isTie(e));
},
finished: function() {
return !!this.get("winner_id");
},
iWonChallenge: function() {
return this.get("winner_id") === App.current_user.id;
},
prize: function() {
var e = parseInt(this.get("entry_fee") || Consts.challenge_min_revenue / 2, 10), t = 2 * e - Math.max(Math.ceil(.2 * e), Consts.challenge_min_revenue);
return 10 * Math.round(t / 10);
},
entryFee: function(e) {
return Math.ceil(.5 * (e + Math.max(Math.ceil(e / 9), Consts.challenge_min_revenue)));
},
showResults: function() {
App.Lightbox.activate({
optional: !0,
backdrop: !0,
width: 700,
template: JST["jsts/challenges/summary"],
challenge: this,
title: G._("challenge.last_round"),
nextChallenge: _.bind(function(e) {
e.preventDefault(), this.play();
}, this),
playAgain: _.bind(function(e) {
e.preventDefault(), App.Challenge.newLB(this);
}, this)
});
},
hasBetterTime: function(e) {
if (!this.otherResult(e)) return !1;
var t = this.myResult(e).time_score, a = this.otherResult(e).time_score;
return a < t ? 0 : t < a && 1;
},
hasBetterScore: function(t, e) {
if (!this.otherResult(e)) return !1;
var a = _.find(this.myResult(e).score_details, function(e) {
return e[0] === t;
})[2], n = _.find(this.otherResult(e).score_details, function(e) {
return e[0] === t;
})[2];
return n < a ? 0 : a < n && 1;
},
formatTime: function(e) {
var t = "ar" === G.lang() ? "\u062b" : "s", a = "ar" === G.lang() ? "\u062f" : "m", n = parseInt(1e3 * (1 - e), 10);
return n < 60 ? n + t : parseInt(n / 60, 10) + a + " " + n % 60 + t;
},
formatField: function(t, e) {
var a = _.find(e.score_details, function(e) {
return e[0] === t;
});
return "won" === t ? G._(a[1]) : a[1];
},
isAccepted: function() {
return this.get("accepted");
},
accept: function() {
var e = _.bind(function() {
var e = this;
this.get("entry_fee") > App.current_user.get("game_tokens") ? App.notEnoughTokens.activate() : App.confirm(G._("Are you sure?"), function() {
e.save({
opponent_id: App.current_user.id
}, {
wait: !0,
url: e.urlRoot() + "/" + e.get("id"),
success: function(e) {
e.get("opponent_id") === App.current_user.id && (e.play(), App.Lightbox.activate({
optional: !1,
backdrop: !0,
template: JST["jsts/challenges/wait_lb"],
width: 300
}));
},
error: function(e, t) {
var a = _.flatten(_.values(JSON.parse(t.responseText).errors));
"challenge_already_in_game" === a[0] ? App.Challenge.alreadyInGameLB.activate(a[1]) : "fraud_contact_us" === a[0] ? App.Lightbox.error(G._(a[0]), {
title: ""
}) : (App.challenge.listView.updateChallenges(), App.Lightbox.error(G._("please pick another challenge"), {
title: G._("challenge.already_accepted")
}));
}
});
}, this, G._("challenge.accept_msg", {
cost: this.get("entry_fee")
}));
}, this);
if (this.get("group")) {
var t = App.current_user.get("group");
if (t && t.id === this.get("group").id) e(); else {
var a = this.get("group");
App.Lightbox.activate({
optional: !0,
backdrop: !0,
title: G._("challenges.group_only_lb_title"),
footer: [ {
type: "a",
name: "Cancel",
action: "cancel"
}, {
type: "button",
name: "Go To Group",
action: "go"
} ],
content: function() {
return $("<div>").append(G._("challenges.group_only_lb_content", {
name: a.name
})).html();
},
go: function(e) {
e.preventDefault(), window.location.href = "/" + G.lang() + "/clubs/" + a.id;
}
});
}
} else e();
},
reject: function() {
var e = this;
App.confirm(G._("Are you sure?"), function() {
e.save({
active: !1
}, {
wait: !0,
url: e.urlRoot() + "/" + e.get("id"),
success: function() {
App.challenge.list.remove(e);
}
});
});
},
cloneModel: function(e) {
if (e) {
var t = e.get("user_id") === App.current_user.id ? "user" : "opponent", a = "user" === t ? "opponent" : "user";
this.set({
user: e.get(t),
user_id: e.get(t + "_id"),
user_uid: e.get(t + "_uid"),
user_name: e.get(t + "_name"),
opponent: e.get(a),
opponent_id: e.get(a + "_id"),
opponent_uid: e.get(a + "_uid"),
opponent_name: e.get(a + "_name"),
num_rounds: e.get("num_rounds"),
powerups: e.get("powerups")
});
}
return this;
}
}), App.Challenge.List = Backbone.Collection.extend({
model: App.Challenge.Model,
url: function() {
return "/" + G.lang() + "/challenges/" + this.game_module;
},
initialize: function() {
var a = this;
App.comm.registerCallback("challenges", function(e) {
_.each(e, function(e) {
if (e.game_module === a.game_module) {
var t = a.get(e.id);
t ? t.set(e) : a.add(e);
}
});
});
},
getByState: function(e) {
var a = this;
return _.each(e, function(t) {
a = new App.Challenge.List(a.select(function(e) {
switch (t) {
case "public_not_mine":
return e.get("user").id !== App.current_user.id && e.get("opponent").id !== App.current_user.id;

case "mine":
return (e.get("user").id === App.current_user.id || e.get("opponent").id === App.current_user.id) && !e.finished();

case "finished":
return e.finished();

case "public":
return !e.get("opponent_id");

case "friends":
return e.get("filters") && e.get("filters").friends;

case "group":
return e.get("filters") && e.get("filters").group;
}
}));
}), a.models;
},
setGameModule: function(e) {
this.game_module = e, App.challenge.filtersView.filters.state = "mine", this.fetch();
},
comparator: function(e) {
return -1 * e.get("updated_at");
},
newChallengeLB: function() {
App.Challenge.newLB();
}
}), $(function() {
App.game.on("started", function() {
App.game.read("first_challenge") && (App.game.inState("hand_more") && (App.Lightbox.hideAll(), 
App.createCookie("cig_challenge_show_1", App.current_user.id), startGuiders("cig_challenge_show_1")), 
App.game.on("change:gs:state", function() {
App.game.inState("in_hand") && !App.game.read("hs.last_round").length && App.game.read("challenge_options.powerups") && _.delay(function() {
App.createCookie("cpug_challenge_show_1", App.current_user.id), startGuiders("cpug_challenge_show_1"), 
$("#game-body-backdrop").show(), $(".power-up").live("click", function(e) {
$(e.target).closest("li").hasClass("disabled") || (App.eraseCookie("cpug_challenge_show_1"), 
guiders.hideAll(), $("#game-body-backdrop").hide());
});
}, 100);
}));
});
}), App.Challenge.newLB = function(e) {
var t = new App.Challenge.Model({
game_module: App.toCamel(App.challenge.list.game_module)
});
App.Lightbox.activate({
model: t.cloneModel(e),
optional: !0,
backdrop: !0,
template: JST["jsts/challenges/new"],
title: G._("challenge.new") + ": " + G._(App.challenge.list.game_module.replace(/_/g, " ")),
form: !0,
klass: "form-horizontal new-challenge-form",
footer: [ {
type: "a",
name: "Cancel",
action: "cancel"
}, {
type: "button",
name: "Create",
action: "create"
} ],
footerMsg: _.string.sprintf('<p class="instructions">%s <a href="#" data-action="challengeRules">%s</a></p>', G._("By creating a challenge, you agree to the"), G._("challenge.rules")),
name: function() {
return "newChallenge";
},
events: {
"click [data-action]": "runAction",
"change #private": "showPrivate",
"change #group_only": "disablePrivate",
"keyup #prize": "updatePrize"
},
updatePrize: function() {
this.updateModel(), this.$("#msg").html(G._("challenge.details", {
entry_fee: this.model.get("entry_fee"),
prize: this.model.prize()
}));
},
challengeRules: function(e) {
App.Lightbox.activate({
optional: !0,
name: function() {
return "challengeRules";
},
title: G._("challenge.rules"),
template: JST["jsts/challenges/rules"],
footer: [ {
type: "a",
name: "Close",
action: "cancel"
} ]
}), e.preventDefault();
},
showPrivate: function(e) {
this.$("#challengePrivateParts").toggle($(e.currentTarget).is(":checked")), $(e.currentTarget).is(":checked") ? (this.$("#group_only").attr({
checked: !1,
disabled: !0
}), this.updateModel()) : (this.model.set({
opponent: null,
opponent_id: null,
opponent_uid: null,
opponent_name: null
}), this.render(), this.setValidations(), this.$("form").valid());
},
disablePrivate: function(e) {
this.updateModel(), $(e.currentTarget).is(":checked") ? (this.$("#private").is(":checked") && this.$("#private").click(), 
this.$("#private").attr("disabled", !0)) : this.$("#private").attr("disabled", !1);
},
updateModel: function() {
var e = parseInt(this.$("#prize").val() || 0, 10), t = this.model.entryFee(e);
this.model.set({
entry_fee: t,
powerups: this.$("#powerups").is(":checked"),
group_only: this.$("#group_only").is(":checked")
});
},
chooseFriend: function() {
var t = this, a = function(e) {
t.model.set({
opponent: e,
opponent_id: e.id,
opponent_uid: e.fb_uid,
opponent_name: e.login
}), t.updateModel(), t.render(), t.$("#group_only").attr("disabled", !0), t.setValidations(), 
t.$("form").valid();
};
App.selectFriends({
collection: App.coplayers,
title: G._("Select a friend to challenge"),
extraListNames: [ "offline", "facebook" ],
maxCount: 1,
msg: function() {
return "";
},
buttonName: "Select",
callback: function(e) {
var t = App.coplayers.get(e[0]);
a({
id: t.id,
fb_uid: t.get("fb_uid"),
login: t.get("login")
});
},
fb_callback: function(e) {
a({
fb_uid: e[0],
login: App.FB.friendsAsUsers.get("FB_" + e[0]).name()
});
}
});
},
visible: function() {
return !0;
},
create: function(e) {
if (this.$("form").valid() && (this.updateModel(), !this.model.get("group_only") || !this.model.get("opponent"))) {
var n = this;
App.confirm(G._("Are you sure?"), function() {
n.model.save({}, {
wait: !0,
success: function(e) {
e.play();
},
error: function(e, t) {
App.Lightbox.deactivate("challenge_wait_lb"), n.deactivate();
var a = _.flatten(_.values(JSON.parse(t.responseText).errors));
"challenge_already_in_game" === a[0] ? App.Challenge.alreadyInGameLB.activate({
gid: a[1]
}) : "fraud_contact_us" === a[0] ? App.Lightbox.error(G._(a[0]), {
title: ""
}) : App.Lightbox.alert(a.join("<br />"));
}
}), App.Lightbox.activate({
optional: !1,
backdrop: !0,
name: function() {
return "challenge_wait_lb";
},
template: JST["jsts/challenges/wait_lb"],
width: 300
});
}, this, 0 === this.model.get("entry_fee") ? "" : G._("challenge.create_msg", {
cost: this.model.get("entry_fee")
})), e.preventDefault();
}
},
activate: function() {
var a = this;
App.Lightbox.prototype.activate.apply(this, arguments), $('.new-challenge-form input[name="prize"]').focus(), 
$.validator.addMethod("enoughTokens", function(e) {
var t = parseInt(e, 10);
return a.model.entryFee(t) <= App.current_user.get("game_tokens");
}), $.validator.addMethod("multipleOfTen", function(e, t) {
return this.optional(t) || parseInt(e, 10) % 10 == 0;
}), $.validator.addMethod("privateSelected", function(e, t) {
return !($(t).is(":checked") && !a.model.get("opponent"));
}), this.setValidations();
},
setValidations: function() {
$(".new-challenge-form form").validate({
rules: {
prize: {
required: !0,
digits: !0,
enoughTokens: !0,
multipleOfTen: !0
},
"private": {
privateSelected: !0
}
},
messages: {
prize: {
required: G._("cannot be empty"),
digits: G._("please enter only digits"),
enoughTokens: G._("you don't have enough tokens"),
multipleOfTen: G._("must be a multiple of ten")
},
"private": {
privateSelected: G._("must select an opponent")
}
}
});
}
});
}, App.Challenge.alreadyInGameLB = App.Lightbox.create({
backdrop: !0,
optional: !0,
title: G._("You are already in another game"),
content: function() {
return G._("challenge_already_in_game");
},
footer: [ {
type: "button",
name: "Back to old game",
action: "returnToGame"
} ],
returnToGame: function() {
window.location = "/" + G.lang() + "/games/" + this.params.gid;
}
}), App.ChallengeSummaryView = App.GameSummaryView.extend({
template: JST["jsts/challenges/summary"],
initialize: function() {
var a = new App.Challenge.Model({
id: App.game.read("challenge_id")
});
(this.challenge = a).on("change", this.render, this), _.delay(_.bind(this.challenge.fetch, this.challenge), 300), 
App.challenge = {}, App.challenge.list = new App.Challenge.List(), App.challenge.list.game_module = App.game.gameName(), 
App.comm.registerCallback("challenges", function(e) {
var t = _.find(e, function(e) {
return e.id === a.id && 1 === e.curr_round.length;
});
t && a.set(t);
});
},
events: {
"click [data-action]": "runAction"
},
runAction: function(e) {
e.preventDefault(), this[$(e.target).data("action")](e);
},
sendFBRequest: function(e) {
this.challenge.sendFBRequest(function() {
$(e.target).hide().next().show();
});
},
nextChallenge: function(e) {
App.comm.registerCallback("redirectToGame", function(e) {
window.location = "/" + G.lang() + "/games/" + e;
}), this.challenge.play(), $(e.currentTarget).append("<img src='/images/loading.gif' class='loadingGif' />");
},
playAgain: function() {
App.Challenge.newLB(this.challenge);
},
newChallenge: function() {
App.challenge.list.fetch().done(function() {
App.challenge.list.newChallengeLB();
});
}
}), $(function() {
App.game.on("started", function() {
App.game.isChallengeGame() && _.each(_.range(1, App.game.read("num_players")), function(e) {
App.game.stackViews["stack_p_" + e].ordered = !1, App.game.stackViews["stack_p_" + e].$el.addClass("with-open-cards");
});
});
}), App.firstGameGuiders = function() {
var e = {
name: G._("Next"),
classString: "btn btn-small btn-primary",
onclick: guiders.next
}, t = {
name: G._("Next"),
classString: "btn btn-small btn-primary",
onclick: guiders.hideAll
}, a = "en" === G.lang() ? 9 : 3, n = (G.lang(), function() {
$("#guiders_overlay").remove(), $("<div id='guiders_overlay'></div>").appendTo("#game-body");
}), i = _.include([ "Handgame", "HandSaudi", "Hareega" ], App.game.gameName()), r = _.include([ "Tarneeb", "Estimation", "Hokm", "Kout", "KoutBo4", "Nathala", "TarneebEgyptian", "TarneebExpress", "TarneebSyrian41" ], App.game.gameName()), s = function() {
guiders.hideAll(), App.Lightbox.activate({
alwaysOnTop: !0,
optional: !0,
backdrop: !0,
title: function() {
return G._("Are you sure?");
},
inGame: !0,
footer: [ {
type: "a",
name: "Cancel",
action: "cancel"
}, {
type: "button",
name: "OK",
action: "confirm"
} ],
confirm: function() {
App.comm.sendGame("leave", {
ref: "first_game"
});
},
cancel: function() {
this.deactivate(), guiders.show(guiders._currentGuiderID);
}
});
}, o = _.map([ {
id: "fgig_start",
buttons: [ e ],
description: G._("first_game.intro_0", {
gm: G._(App.game.gameName())
}),
next: "fgig_you_here",
showAt: {
state: "new_game"
}
}, {
id: "fgig_you_here",
attachTo: "#player-0",
buttons: [ e ],
next: "fgig_click_start",
description: G._("first_game.you_set_here"),
onShow: n,
highlight: "#player-0"
}, {
id: "fgig_click_start",
attachTo: "#player-0 .player-actions .btn",
description: G._("first_game.click_start"),
onShow: n,
highlight: "#player-0"
}, {
id: "fgig_partnering",
buttons: [ t ],
description: G._("first_game.choose_partner"),
showAt: {
state: "partnering"
}
}, {
id: "fgig_bid",
buttons: [ t ],
description: G._("first_game.bid_" + (App.game.read("partnering") ? "partnering" : "no_partnering")),
shouldSkip: function() {
return !r;
},
showAt: {
state: "hand_more",
action: "bid",
count: 0
}
}, {
id: "fgig_hand_take_card",
attachTo: "#deck",
description: G._("first_game.handgame.take_card"),
onShow: n,
highlight: "#deck",
shouldSkip: function() {
return !i;
},
showAt: {
state: "in_hand",
action: "take_card",
count: 0,
onTurn: !0
}
}, {
id: "fgig_behold_your_stack",
attachTo: "#seat-1 .card-stack.hand",
description: G._("first_game.your_stack_" + (i ? "handgame" : "normal")),
onShow: n,
highlight: "#seat-1 .card-stack.hand",
showAt: {
state: "in_hand",
action: "move",
count: 0,
onTurn: !0
}
}, {
id: "fgig_ordering_stacks",
attachTo: "#stack_ordering_1",
buttons: [ t ],
description: G._("first_game.ordering_stacks"),
onShow: n,
highlight: "#seat-1 .card-stack.hand, #stack_ordering_0, #stack_ordering_1, #stack_ordering_2, #stack_ordering_3",
shouldSkip: function() {
return !i;
},
showAt: {
state: "in_hand",
action: "take_card",
count: 2,
onTurn: !0
}
}, {
id: "fgig_aklat",
attachTo: "#player-0 .score",
buttons: [ t ],
position: 3,
description: G._("first_game.aklat"),
onShow: n,
highlight: "#player-0",
shouldSkip: function() {
return !$("#player-0 .score").length;
},
width: 300,
showAt: {
state: "in_hand",
action: "move",
count: 2,
onTurn: !0
}
}, {
id: "fgig_scores",
attachTo: "#tab-game-summary",
buttons: [ t ],
position: a,
description: G._("first_game.scores"),
highlight: "#tab-game-summary",
showAt: {
state: "in_hand",
action: "move",
count: 4,
onTurn: !0
}
}, {
id: "fgig_chat",
attachTo: "#tab-chat textarea",
buttons: [ t ],
description: G._("first_game.chat"),
highlight: "#tab-chat textarea",
autoFocus: !1,
width: 300,
showAt: {
state: "in_hand",
action: "move",
count: 6,
onTurn: !0
}
}, {
id: "fgig_leave",
attachTo: "#game-body a[data-item='LeaveGame']",
description: G._("first_game.leave"),
xButton: !0,
width: 300,
overlay: null,
showAt: {
state: "in_hand",
action: "move",
onTurn: !1,
check: function(e) {
return 8 <= e;
}
}
}, {
id: "fgig_handgame_started",
description: G._("first_game.handgame_started"),
buttons: [ t ],
showAt: {
state: "in_hand",
action: "move",
count: 0
},
shouldSkip: function() {
return !i;
}
}, {
id: "fgig_handgame_nzool",
attachTo: ".on-table:visible:not('.ordering'):first",
description: G._("first_game.handgame_nzool"),
buttons: [ t ],
shouldSkip: function() {
return !i;
},
showAt: {
state: "in_hand",
action: "go_down",
onTurn: !0,
count: 1
}
} ], function(e) {
var t = {
buttons: [],
title: "",
autoFocus: !0,
overlay: !0,
position: 12,
numShown: 0,
maxNumShow: 1,
onHide: App.Lightbox.showAll
};
e.attachTo || (_.extend(e, {
attachTo: "#game-canvas",
offset: {
top: 250,
left: 0
}
}), e.classString = (e.classString || "") + " no-arrow-guider");
var a = _.extend({}, t, e);
return a.buttons.push({
name: G._("first_game.skip"),
classString: "btn btn-small btn-light",
onclick: s
}), a;
});
_.each(o, function(e) {
guiders.createGuider(e);
});
var p = function(e) {
var t, a = App.game.read("state_act_cnt." + App.current_user.get("index"), {});
return e.r = e.r || 0, App.game.read("track_scores", []).length === e.r && (!!App.game.inState(e.state) && (!(e.onTurn && !App.game.read("timeouts.0")) && (e.action && _.isNumber(e.count) ? (t = a[e.action] || 0, 
e.count === t) : !e.check || !_.isFunction(e.check) || (t = a[e.action] || 0, e.check(t)))));
}, c = function() {
var e = _.find(o, function(e) {
return e.showAt && p(e.showAt) && (!e.shouldSkip || !e.shouldSkip());
});
e && (guiders._currentGuiderID === e.id || e.numShown >= e.maxNumShow) || (e && guiders._currentGuiderID === e.id || guiders.hideAll(), 
e ? (e.overlay && App.Lightbox.hideAll(), guiders.show(e.id), e.numShown += 1) : App.Lightbox.showAll());
};
App.game.on("change:gs:state_act_cnt:0 change:gs:hs:player_turn start-first-game-guiders", function() {
_.defer(c);
}), App.game.trigger("start-first-game-guiders");
}, $(function() {
App.game.on("started", function() {
App.game.isFirstGame() && App.firstGameGuiders();
});
}), function() {
function d(e) {
var n = 52, i = 72;
return _.map(e, function(e) {
var t = $("#seat-" + e), a = t.position();
return t.hasClass("right") && (a.left -= n + 20), t.hasClass("left") && (a.left += n + 10), 
t.hasClass("top") && (a.top += i), t.hasClass("bottom") && (a.top -= i), a;
});
}
function l(e, t) {
var a = $("<div class='card'></div>"), n = _.map(_.range(e), function(e) {
return "<div class='back' style='left: " + e * t + "px;'></div>";
});
return a.html(n.join("")), a;
}
App.animateDealer = function(e, i) {
e = _.isNumber(e) ? e : 1;
var r = d((i = _.extend({
seats: [ 1, 4, 7, 10 ],
duration: 700,
delay: 500,
spacing: 3
}, i || {})).seats), t = r[_.indexOf(i.seats, e)], a = _.indexOf(i.seats, e), s = $(".card-stack"), o = l(10, i.spacing), p = l(5, i.spacing), n = {
position: "absolute",
top: t.top,
left: t.left
};
o.css(n), p.css(n), s.hide(), App.Lightbox.hideAll(), $("#game-canvas").append(o);
var c = (a + 1) % i.seats.length;
_.each(_.range(i.seats.length - 1), function(t) {
var a = r[c], n = i.seats[c];
_.delay(function() {
var e = p.clone();
$("#game-canvas").append(e), e.animate({
top: a.top,
left: a.left
}, {
duration: i.duration,
complete: function() {
e.remove(), $("#seat-" + n + " .card-stack").show(), t === i.seats.length - 2 && o.fadeOut(i.duration / 2, function() {
s.show(), App.Lightbox.showAll();
});
}
});
}, t * i.delay), c = (c + 1) % i.seats.length;
});
};
}(), App.TarneebGame = App.CardGame.newGameHash(), App.TarneebGame.classBind("change:gs", function() {
if ("hand_more" === this.readOld("state")) if (_.all(this.readOld("hs.finished_bidding"), _.identity) && this.hasKey("hs.tarneeb")) {
var e = this.readOld("hs.bidder");
this.vaporize(e, this.suitText(this.read("hs.tarneeb")));
} else {
var t = this.readOld("hs.next_bidder");
this.isChanged("hs.bid") ? this.vaporize(t, this.bidText(this.read("hs.bid")).toString()) : this.isChanged("hs.finished_bidding") && this.vaporize(t, this.passText());
}
}, "tarneeb-vapor"), App.TarneebGame.classBind("change:gs started", function() {
_.each(this.seats, function(e) {
App.clearCardIcons(e);
var t = e.get("player").get("index"), a = this.read("hs.bid");
if (a && this.read("hs.bidder") === t) {
var n = [ "nosuit", "heart", "spade", "diamond", "club" ][this.read("hs.tarneeb", -1) + 1];
App.addCardIcon(e, n + "-" + a, G._("The Bid"), [ {
klass: "fa fa-legal",
style: "padding: 0 15px;"
} ]);
}
}, this);
}, "card-icons"), App.TarneebGame.TarneebStack = App.StackView.extend({
canPlay: function(e, t) {
if (t.owner() !== App.game.getActingIndex()) return !1;
if (!App.game.playerHasTurn(App.game.getActingIndex())) return !1;
if (!App.game.inState("in_hand")) return !1;
var a, n = App.game.stacks.stack_table;
return !!n.isUpToDate() && !(!n.empty() && (a = n.get("cards").first().suit()) !== e.suit() && _.any(t.get("cards").map(function(e) {
return e.suit() === a;
}), _.identity));
},
onClick: function(e, t) {
var a = [ "move", t.get("name"), "stack_table", e.id ];
App.commander.performCmdExternal(a), App.comm.moveCard(a[3], a[1], a[2]);
}
}), App.TarneebGame.stackView = function() {
return App.TarneebGame.TarneebStack;
}, App.TarneebGame.gameSummaryInfo = function() {
var e = [], t = App.game.read("hs.bid");
if (t && ("Estimation" !== App.game.read("name") || App.game.read("round") < 14)) {
var a = App.game.players[App.game.read("hs.bidder")].name();
e.push({
label: G._("The Bid"),
value: App.game.bidText(t) + " (" + a + ")"
});
}
var n = App.game.read("hs.tarneeb");
return _.isNumber(n) && e.push({
label: App.game.trumpText(),
value: -1 === n ? G._("No Trump") : App.game.suitText(n)
}), App.game.read("game_options.final_score") && e.push({
label: G._("games.final_score"),
value: App.game.read("game_options.final_score")
}), e;
}, App.TarneebGame.iAmPartnerChooser = function() {
return !App.current_user.isWatcher() && this.read("partner_chooser") === this.getActingIndex();
}, App.TarneebGame.iAmPartnerAccepter = function() {
return !App.current_user.isWatcher() && _.include(this.read("partner_with"), this.getActingIndex());
}, App.TarneebGame.playerIsBidder = function(e) {
return this.read("hs.bidder") === e;
}, App.TarneebGame.iAmNextBidder = function() {
return this.read("hs.next_bidder") === this.getActingIndex() && !App.current_user.isWatcher();
}, App.TarneebGame.iAmBidder = function() {
return this.read("hs.bidder") === this.getActingIndex() && !App.current_user.isWatcher();
}, App.TarneebGame.bidText = function(e) {
return e;
}, App.TarneebGame.passText = function() {
return G._("tarneeb.pass");
}, App.TarneebGame.trumpText = function() {
return G._("Trump");
}, App.TarneebGame.suitText = function(e) {
var t = [ "Hearts", "Spades", "Diamonds", "Clubs" ];
return G._(t[e]);
}, App.TarneebGame.chooseTrumpText = function() {
return G._("Choose your tarneeb");
}, function() {
App.TarneebGame.playerCircleMonitoredEVs = function() {
return "change:gs:hs:num_eaten";
};
var h = function(e) {
return _.inject(e, function(e, t) {
return e + App.game.read("hs.num_eaten." + t, 0);
}, 0);
};
App.TarneebGame.getPlayerCircle = function(e) {
var t = App.game.read("num_players"), a = App.game.read("partnering") && !App.game.read("score_per_player", !1) ? 2 : t, n = App.game.read("cards_per_player"), i = e.playerIndex(), r = "", s = _.select(_.range(t), function(e) {
return e % a == i % a;
}), o = _.select(_.range(t), function(e) {
return e % a != i % a;
}), p = h(s);
if (_.any(s, function(e) {
return App.game.playerIsBidder(e);
})) {
var c = h(o), d = App.game.read("hs.bid", 0);
d <= p ? r = "positive" : n - c < d && (r = "negative");
}
var l = G._("Eaten cards"), u = $("<div class='score' rel='tooltip' title='" + l + "'>" + App.game.read("hs.num_eaten." + i, 0) + "</div>");
return u.addClass(r), u;
};
}(), App.TarneebGame.scoresTabExtension = {
roundHeader: function(e) {
var t, a;
return e ? (t = App.game.players[e[1]].name(), a = e[2]) : (t = G._("Bidder"), a = G._("The Bid")), 
_.string.sprintf("%s (%s)", t, a);
},
roundWinner: function(e, t, a) {
return e[1] % 2 === (e[3] ? a : 1 - a);
}
}, App.TarneebGame.classBind("started", function() {
for (var e = 7; e < 14; e++) App.sound.load("tarneeb_" + e, "/media/tarneeb_" + e + "_" + G.lang().toLowerCase() + ".mp3");
_.each(App.Card.RealSuits, function(e, t) {
App.sound.load("suit_" + t, "/media/general_" + e.toLowerCase() + "_" + G.lang().toLowerCase() + ".mp3");
}), App.sound.load("general_pass", "/media/general_pass.mp3");
}), App.TarneebGame.classBind("change:gs", function() {
"hand_more" === this.readOld("state") && (_.all(this.readOld("hs.finished_bidding"), _.identity) && this.hasKey("hs.tarneeb") ? App.sound.play("suit_" + this.read("hs.tarneeb")) : this.isChanged("hs.bid") ? App.sound.play("tarneeb_" + this.read("hs.bid").toString()) : this.isChanged("hs.finished_bidding") && App.sound.play("general_pass"));
}, "tarneeb-sound"), App = window.App || {}, App.PartnerChoose = App.Lightbox.extend({
inGame: !0,
form: !0,
klass: "form-horizontal",
title: function() {
return G._(App.game.gameIs("baloot") ? "Please choose your brother" : "Please choose your partner");
},
template: JST["jsts/games/tarneeb/partner_choose"],
footer: [ {
type: "button",
name: "Choose",
action: "choose"
} ],
visible: function() {
return this.model.inState("partnering") && this.model.iAmPartnerChooser() && _.isEmpty(this.model.read("partner_with"));
},
choose: function() {
App.comm.sendGame("choose", {
partners: _.map(this.$(".partnerChooseInput"), function(e) {
return parseInt($(e).val(), 10);
})
}), this.deactivate();
}
}, {
monitoredEvents: [ "change:gs:state", "change:gs:partner_chooser", "change:gs:partner_with", "change:players" ]
}), App.PartnerAccept = App.Lightbox.extend({
inGame: !0,
form: !0,
klass: "form-horizontal",
title: function() {
return G._(App.game.gameIs("baloot") ? "Please choose your brother" : "Please choose your partner");
},
template: JST["jsts/games/tarneeb/partner_accept"],
footer: [ {
type: "a",
name: "No",
action: "reject"
}, {
type: "button",
name: "Yes",
action: "accept"
} ],
visible: function() {
return this.model.inState("partnering") && this.model.iAmPartnerAccepter();
},
accept: function() {
App.comm.sendGame("accept", {
accept: "true"
}), this.deactivate();
},
reject: function() {
App.comm.sendGame("accept"), this.deactivate();
}
}, {
monitoredEvents: [ "change:gs:state", "change:gs:partner_with", "change:players" ]
}), App.partnerChoose = new App.PartnerChoose({
model: App.game
}), App.partnerAccept = new App.PartnerAccept({
model: App.game
}), App = window.App || {}, App.TarneebBid = App.Lightbox.extend({
inGame: !0,
form: !0,
klass: "form-horizontal",
title: G._("The Bid"),
template: JST["jsts/games/tarneeb/bid"],
footer: [ {
type: "a",
name: "Pass",
action: "bidPass",
visible: function() {
return _.select(App.game.read("hs.finished_bidding"), _.identity).length < App.game.read("num_players") - 1 || 0 < App.game.read("hs.bid");
}
}, {
type: "button",
name: "Bid",
action: "bidGo"
} ],
visible: function() {
return this.model.inState("hand_more") && _.isFunction(this.model.iAmBidder) && this.model.iAmNextBidder() && !_.all(this.model.read("hs.finished_bidding"), _.identity) && !App.game.gameIs("TarneebEgyptian") && !App.game.gameIs("Estimation");
},
bidGo: function() {
App.comm.sendGame("bid", {
bid: this.$("#bidValue").val()
}), this.deactivate();
},
bidPass: function() {
App.comm.sendGame("bid"), this.deactivate();
}
}, {
monitoredEvents: [ "change:gs:state", "change:gs:hs:next_bidder", "change:gs:hs:finished_bidding" ]
}), App.TarneebChoose = App.Lightbox.extend({
inGame: !0,
form: !0,
klass: "form-horizontal",
title: App.TarneebGame.trumpText(),
template: JST["jsts/games/tarneeb/tarneeb"],
footer: [ {
type: "button",
name: "Choose",
action: "tarneebGo"
} ],
visible: function() {
return this.model.inState("hand_more") && _.isFunction(this.model.iAmBidder) && this.model.iAmBidder() && _.all(this.model.read("hs.finished_bidding"), _.identity) && !App.game.gameIs("TarneebEgyptian") && !App.game.gameIs("Estimation") && !App.game.gameIs("TarneebSyrian41");
},
tarneebGo: function() {
this.selectedRadioValue("tarneebSuit") && (App.comm.sendGame("tarneeb", {
tarneeb: this.selectedRadioValue("tarneebSuit")
}), this.deactivate());
}
}, {
monitoredEvents: [ "change:gs:state", "change:gs:hs:bidder", "change:gs:hs:finished_bidding" ]
}), App.tarneebBid = new App.TarneebBid({
model: App.game
}), App.tarneebChoose = new App.TarneebChoose({
model: App.game
}), App.TarneebGame.classBind("change:gs:hs:next_bidder", function() {
App.game.loadStacks();
}), App.TarneebGame.classBind("change:gs:state", function() {
this.inState("hand_more") && "hand_more" != this.readOld("state") && _.defer(function() {
App.animateDealer(3 * App.game.read("dealer") + 1);
});
}), App.HandgameGame = App.CardGame.newGameHash(), function() {
App = window.App || {}, App.HandGameStackModel = App.CardStack.extend({
readCards: function() {
var e = "stack_p_" + App.game.getActingIndex();
if (this.get("name") !== e || App.game.observer) App.CardStack.prototype.readCards.apply(this, arguments); else {
var n = App.game.getSavedOrder(), i = _.clone(App.game.read("hs.stacks." + e + ".contains_new", [])).map(function(e) {
return e.val;
}), r = _.select(App.game.myOrderingStacks(), function(e) {
e.get("cards").reset();
var t = e.get("name");
return App.game.stacks[t.replace("ordering", "ontable")].empty();
});
_.each(App.game.myOrderingStacks(), function(e) {
var t = e.get("name");
if (n[t] && 0 < n[t].length && _.all(_.map(n[t], function(e) {
return _.include(i, e);
}), _.identity)) {
i = _.difference(i, n[t]);
var a = r.shift();
a ? a.get("cards").reset(_.map(n[t], function(e) {
return {
id: parseInt(e, 10)
};
})) : (i = i.concat(n[t]), n[t] = []);
}
});
var t = [];
n[e] && _.all(_.map(n[e], function(e) {
return _.include(i, e);
}), _.identity) && (i = _.difference(i, n[e]), t = n[e]), this.get("cards").reset(_.map(t.concat(i), function(e) {
return {
id: parseInt(e, 10)
};
}));
}
}
}), App.HandGameStack = App.StackView.extend({
onClick: function(e, t) {
if (App.game.iHaveTurn()) if (App.game.iStabbed() || "stack_deck" !== t.get("name")) {
if (t.get("name") === "stack_p_" + App.game.getActingIndex()) {
App.comm.sendGame("move", {
card: e.id,
from_name: t.get("name"),
to_name: "stack_table_fire"
});
var a = [ "move", t.get("name"), "stack_table_fire", e.id ];
App.commander.performCmdExternal(a);
}
} else if (!App.game.stackViews.stack_deck.$(".stack-deck-loading").length) {
App.comm.sendGame("take_card", {
stack: t.get("name")
});
var n = $("<img>", {
"class": "loadingGif stack-deck-loading",
src: "/images/loading.gif"
});
App.game.stackViews.stack_deck.$el.append(n), setTimeout(function() {
n.remove();
}, 5e3);
}
},
offsetCardIndex: function(e, n) {
var t = App.StackView.prototype.offsetCardIndex.apply(this, arguments);
if (this.model.get("name").match(/^stack_ontable_(\d+)$/)) {
var i = _.map(this.model.get("cards").without(App.game.fillerCard), function(e) {
return e.val();
}), a = i.length + 1, r = _.sortBy(_.range(a), function(e) {
return Math.abs(t - e);
});
return _.find(r, function(e) {
var t = _.clone(i), a = new App.Card({
id: t[e]
}).isJoker() ? 1 : 0;
return t.splice(e, a, n.data("card").val()), 0 < App.game.cardsSum(t);
}) || 0;
}
return t;
},
onDrop: function(e, t, a, n, i) {
if (this.model.get("name").match(/^stack_ordering_(\d+)$/) && !this.model.get("cards").include(e) && 5 <= this.model.get("cards").without(App.game.fillerCard).length) App.game.fillerCard.remove(); else {
var r = this.offsetCardIndex(i, n);
if (this.model.get("name") === "stack_p_" + App.game.getActingIndex() || this.model.get("name").match(/^stack_ordering_(\d+)$/)) "stack_table_fire" === a.get("name") && App.comm.sendGame("move", {
card: e.id,
from_name: "stack_table_fire",
to_name: "stack_p_" + App.game.getActingIndex(),
card_index: r
}), a.removeCard(e), this.model.addCard(e, r); else if (this.model.get("name").match(/^stack_ontable_(\d+)$/) && App.game.iHaveTurn()) {
r = r >= this.model.get("cards").length ? this.model.get("cards").length - 1 : r;
var s = "stack_table_fire" === a.get("name") ? "stack_table_fire" : "stack_p_" + App.game.getActingIndex();
App.comm.sendGame("add_to_ontable", {
card: e.id,
from_name: s,
to_name: this.model.get("name"),
card_index: r
}), App.commander.performCmdExternal([ "move", a.get("name"), this.model.get("name"), e.id, r ]);
} else "stack_table_fire" === this.model.get("name") && App.game.iHaveTurn() && App.game.iStabbed() && (App.comm.sendGame("move", {
card: e.id,
from_name: "stack_p_" + App.game.getActingIndex(),
to_name: "stack_table_fire"
}), App.commander.performCmdExternal([ "move", a.get("name"), this.model.get("name"), e.id ]));
App.game.fillerCard.remove(), App.game.saveOrder();
}
},
canPlay: function(e, t) {
return !("stack_deck" !== t.get("name") && !App.game.iStabbed()) && !!App.game.stacks.stack_table_fire.isUpToDate();
},
onMouseOver: $.noop,
onMouseOut: $.noop
}, {
positionAttrs: function(e) {
return _.extend({}, App.StackView.positionAttrs(e), 0 === e ? {
dx: 22,
ordered: !1
} : {
ordered: !1
});
}
}), App.HandgameGame.stackView = function() {
return App.HandGameStack;
}, App.HandgameGame.GameSeatClass = App.GameSeat.extend({}, {
loadStacks: function(e) {
var t = e.get("player").get("index"), a = _.flatten(_.map(_.range(4 * t, 4 * t + 4), function(e) {
return [ "stack_ordering_" + e, "stack_ontable_" + e ];
}).concat([ "stack_p_" + t ]));
_.each(a, function(e) {
App.game.stacks[e] || (App.game.stacks[e] = new App.HandGameStackModel({
name: e
}), e.match(/^stack_ordering_(\d+)$/) && (App.current_user.isWatcher() || t !== App.current_user.get("index") ? App.game.stacks[e].set({
extendsStack: "stack_p_" + t
}) : App.game.stacks[e].set({
kind: "p",
owner: App.game.getActingIndex()
}))), App.game.stacks[e].readCards();
});
}
});
var o = function(e) {
var t = "stack_ontable_" + e, a = App.game.stacks[t], n = e % 4, i = Math.floor(e / 4), r = (i - App.current_user.get("index") + 4) % 4, s = !App.current_user.isWatcher() && i === App.current_user.get("index"), o = 15 < e;
App.game.stacks[t] || (a = App.game.stacks[t] = new App.HandGameStackModel({
name: t
})), a.readCards(), App.game.stackViews[a.get("name")] || (App.game.stackViews[a.get("name")] = new (App.game.stackView())({
id: a.get("name"),
className: "on-table",
model: a,
dx: 12,
left: o ? 105 * (n + 1) + 50 : [ 105 * n + 50, null, 105 * n + 50, 50 ][r],
right: o ? null : [ null, 50, null, null ][r],
top: o ? -285 : [ -105, 45 * n - 285, -330, 45 * n - 285 ][r],
ordered: !1,
parent: "#stack-container",
dynamicWidth: !0,
droppable: !0,
canDrop: function() {
return App.game.iHaveTurn();
}
}), App.game.cleanBind("change:gs:hs:player_turn", [ App.game.stackViews[a.get("name")] ], function() {
App.game.stackViews[a.get("name")].$el.droppable("option", "disabled", !App.game.stackViews[a.get("name")].canDrop());
}), !o && s && a.cleanBind("change", [ App.game.stackViews[a.get("name")] ], function() {
this.model.empty() ? App.game.stackViews["stack_ordering_" + e].$el.show() : (App.game.stackViews["stack_ordering_" + e].$el.hide(), 
App.game.stackViews["stack_ordering_" + e].model.get("cards").reset());
}, App.game.stackViews[a.get("name")])), App.game.stackViews[a.get("name")].render();
};
App.HandgameGame.loadStacks = function() {
var e = "stack_table_fire";
this.stacks[e] || (this.stacks[e] = new App.HandGameStackModel({
name: e
})), this.stackViews[e] || (this.stackViews[e] = new (this.stackView())({
id: "upcards",
className: "card-stack face-up draggable-stack-cursor",
model: this.stacks[e],
ordered: !1,
parent: "#game-canvas",
closed: !0,
draggable: !0,
droppable: !0,
showEmpty: !0,
withFillerCard: !0,
canDrop: function() {
return App.game.iStabbed();
}
}), App.game.cleanBind("change:gs:hs:player_stabbed:" + App.game.getActingIndex(), [ App.game.stackViews.stack_table_fire ], function() {
App.game.stackViews.stack_table_fire.$el.droppable("option", "disabled", !App.game.stackViews.stack_table_fire.canDrop());
})), this.stacks[e].readCards(), e = "stack_deck", this.stacks[e] || (this.stacks[e] = new App.HandGameStackModel({
name: e,
alwaysClosed: !0
})), this.stackViews[e] || (this.stackViews[e] = new (this.stackView())({
id: "deck",
className: "card-stack clickable-stack-cursor",
model: this.stacks[e],
ordered: !1,
closed: !0,
showEmpty: !0,
parent: "#game-canvas"
})), this.stacks[e].readCards(), _.each(_.range(0, 18), o), _.invoke(this.seats, "loadStacks");
}, App.HandgameGame.SeatViewClass = App.SeatView.extend({}, {
renderStacks: function(e) {
var t = e.playerIndex(), r = e.model.get("position"), s = [], a = App.game.stacks["stack_p_" + t];
App.game.stackViews[a.get("name")] || (App.game.stackViews[a.get("name")] = new (App.game.stackView().PlayerStackView(r))({
model: a,
noReload: !App.current_user.isWatcher() && 0 === r
}), t === App.game.getActingIndex() && App.game.stackViews[a.get("name")].attrs({
withFillerCard: !0,
draggable: !0,
droppable: !0,
hoverClass: "",
showEmpty: !0
})), s.push(App.game.stackViews[a.get("name")]), _.each(_.range(4 * t, 4 * t + 4), function(e) {
var t, a = e % 4, n = Math.floor(e / 4), i = (App.current_user.get("index"), !App.current_user.isWatcher() && n === App.current_user.get("index"));
t = App.game.stacks["stack_ordering_" + e], App.game.stackViews[t.get("name")] || (i && (App.game.stackViews[t.get("name")] = new (i ? App.game.stackView().PlayerStackView(r) : App.game.stackView())({
id: t.get("name"),
className: "ordering on-table",
model: t,
dx: 12,
ordered: !1,
noReload: !0,
left: 105 * a + 50,
top: -105,
selector: null,
parent: "#stack-container",
dynamicWidth: !0,
showEmpty: function() {
return i && App.game.stacks["stack_ontable_" + e].empty();
}
})), n === App.game.getActingIndex() && App.game.stackViews[t.get("name")].attrs({
withFillerCard: !0,
draggable: !0,
droppable: !0
})), App.game.stackViews[t.get("name")] && s.push(App.game.stackViews[t.get("name")]), 
o(e);
}), _.invoke(s, "render");
}
});
}(), App.HandgameGame.gameSummaryInfo = function() {
var e = [];
return e.push({
label: G._("Round"),
value: parseInt(App.game.read("round"), 10) + 1
}), e;
}, App.HandgameGame.noLastRound = !0, App.HandgameGame.iStabbed = function() {
return this.read("hs.player_stabbed", {})[this.getActingIndex()];
}, App.HandgameGame.iTookFromTable = function() {
return this.read("hs.player_took_from_table") === this.getActingIndex();
}, App.HandgameGame.getTotal = function() {
var t = _.sortBy(this.myOrderingStacks(), function(e) {
return e.get("name");
}), e = _.pluck($(".groupCheckbox:checked"), "value");
return _.inject(_.map(e, function(e) {
return this.stackSum(t[e]) || 0;
}, this), function(e, t) {
return e + t;
}, 0);
}, App.HandgameGame.stackSum = function(e) {
var t = e.get("cards").map(function(e) {
return e.val();
});
return this.cardsSum(t);
}, App.HandgameGame.cardsSum = function(a) {
for (var n = {
8: 10,
9: 10,
10: 10,
11: 10,
12: 11
}, e = 0; e < 8; e++) n[e] = e + 2;
if (a.length < 3) return 0;
if (_.uniq(a).length !== a.length) return 0;
if (1 < _.intersect(a, [ 52, 53 ]).length) return 0;
var t = _.select(a, function(e) {
return 52 !== e && 53 !== e;
}), i = _.map(t, function(e) {
return e % 13;
}), r = _.map(t, function(e) {
return parseInt(e / 13, 10);
}), s = 0;
if (1 === _.uniq(r).length && 1 < t.length) {
var o = _.map(_.range(0, 14 - a.length), function(e) {
return _.range(e, e + a.length);
});
o.unshift(_.flatten([ 12, _.range(0, a.length - 1) ]));
var p = [];
if (_.each(_.select(o, function(e) {
return -1 !== _.indexOf(e, i[0]);
}), function(e) {
_.each([ e, _.clone(e).reverse() ], function(e) {
var t = _.map(_.zip(a, e), function(e) {
return 52 === e[0] || 53 === e[0] || e[0] % 13 === e[1];
});
_.all(t, _.identity) && p.push(e);
});
}), !p.length) return 0;
s = _.inject(_.last(p), function(e, t) {
return e + n[t];
}, 0);
} else {
if (1 !== _.uniq(i).length) return 0;
if (4 < a.length) return 0;
s = n[i[0]] * a.length;
}
return s;
}, App.HandgameGame.noGroups = function() {
return _.all(_.map(this.myOrderingStacks(), function(e) {
return e.empty();
}), _.identity);
}, App.HandgameGame.myOrderingStacks = function() {
return _.select(this.stacks, function(e) {
return e.get("owner") === this.getActingIndex() && !e.get("name").match(/^stack_p_(\d+)$/);
}, this);
}, App.saveOrderKey = function() {
return App.game.read("id") + "-" + App.game.player_id + "-" + App.game.player_index + "-" + App.game.read("round");
}, App.HandgameGame.saveOrder = function() {
var e = _.inject(_.flatten([ this.myOrderingStacks(), this.stacks["stack_p_" + this.getActingIndex()] ]), function(e, t) {
return e[t.get("name")] = t.get("cards").pluck("id"), e;
}, {}), t = App.saveOrderKey();
$.jStorage.set(t, e), $.jStorage.setTTL(t, 36e5);
}, App.HandgameGame.getSavedOrder = function() {
return $.jStorage.get(App.saveOrderKey(), {});
}, App.HandgameGame.getPlayerCircle = null, App.HandgameGame.scoresTabExtension = {
gameWinner: function(e) {
var t = App.game.scores();
return t[e] === _.min(t) && _.without(t, t[e]).length === t.length - 1;
},
roundWinner: function(e, t, a) {
return e[0][a] < 0;
}
}, App.HandgameGame.classBind("started", function() {
_.each([ "1_kart", "2_kart", "3_kart", "hand", "tanzeel", "tarkeeb" ], function(e) {
App.sound.load("handgame_" + e, "/media/handgame_" + e + ".mp3");
});
}), App.HandgameGame.cardMoveSound = function(e) {
this.inState("in_hand") && (e.to.match(/^stack_ontable_(\d+)$/) ? App.sound.play("handgame_tarkeeb") : App.sound.play("card_played"));
}, App = window.App || {}, App.GoDown = App.Lightbox.extend({
inGame: !0,
title: function() {
return G._(App.game.noGroups() ? "Error" : "Go Down");
},
template: JST["jsts/games/handgame/go_down"],
form: !0,
optional: !0,
events: {
"click [data-action]": "runAction",
"change :checkbox": "updateTotalSum"
},
footer: [ {
type: "a",
name: "Cancel",
action: "cancel"
}, {
type: "button",
name: "Go Down",
action: "goDown",
visible: function() {
return !App.game.noGroups();
}
} ],
activate: function() {
App.Lightbox.prototype.activate.apply(this, arguments), this.updateTotalSum();
},
goDown: function() {
var t = _.sortBy(this.model.myOrderingStacks(), function(e) {
return e.get("name");
}), e = _.map($(":checkbox:checked"), function(e) {
return t[parseInt(e.value, 10)].get("cards").pluck("id");
});
!this.model.read("hs.player_went_down")[this.model.getActingIndex()] && _.flatten(e).length < 14 && this.model.getTotal() < 51 ? App.Lightbox.error(G._("sum of cards is not enough")) : (this.deactivate(), 
App.comm.sendGame("go_down", {
groups: e
}));
},
updateTotalSum: function() {
this.$("#totalSum").html(this.model.getTotal());
}
}), App.goDown = new App.GoDown({
model: App.game
}), App.HandgameGame.classBind("started", function() {
App.gameActions.addItem({
id: "goDown",
name: "Go Down",
visible: function() {
return App.game.iHaveTurn() && App.game.iStabbed();
},
onClick: function() {
App.goDown.activate();
},
monitoredEvents: [ "change:gs:hs:player_turn", "change:gs:state", "change:gs:hs:player_stabbed" ]
});
}), App.HandgameGame.gameMessage = function() {
return this.iHaveTurn() ? this.iStabbed() ? this.iTookFromTable() ? "You need to go down" : "Throw a card by dragging it to the floor" : "Pick a card by clicking the pack or dragging the card from the floor" : this.inState("in_hand") ? "Organize your cards in the boxes on the table to go down" : void 0;
}, App.BanakilGame = App.CardGame.newGameHash();

var NApp = {
Banakil: {}
};

NApp.Banakil.state = {}, NApp.Banakil.player_stabbed = {}, NApp.Banakil.updateState = function(e) {
this.oldState = this.state;
var a = NApp.myStackName();
if (this.player_stabbed = e.hs.player_stabbed, _.each(e.hs.stacks, function(e, t) {
t === a && this.oldState[a] || (this.state[t] = _.clone(e.contains_new));
}, this), App.current_user.isPlaying()) {
var t = _.inject(e.hs.stacks[a].contains_new, function(e, t) {
return e[t.id] = t, e;
}, {}), n = [ a ].concat(_.map(_.range(5), function(e) {
return "ordering_" + e;
}));
_.each(n, function(e) {
e.match(/ordering_/) && (this.state[e] = _.map(_.select(this.state[e], function(e) {
return e && t[e.id];
}), function(e) {
return t[e.id];
}));
}, this);
var i = _.inject(n, function(a, n) {
return NApp.Banakil.state[n] ? _.each(NApp.Banakil.state[n], function(e, t) {
a[e.id] = {
s: n,
i: t
};
}) : NApp.Banakil.state[n] = [], a;
}, {}), r = _.select(e.hs.stacks[a].contains_new, function(e) {
return !i[e.id] || i[e.id].s === a;
}, this);
this.state[a] = _.sortBy(r, function(e, t) {
return i[e.id] ? i[e.id].i : 200 + t;
});
}
};

var fillRow = function(e) {
for (var t = 0, a = [], n = [], i = 0; i < e.length; i++) {
var r = e[i][1];
t + r <= 24 ? (a.push(e[i]), t += r) : n.push(e[i]);
}
return [ a, n ];
};

NApp.Banakil.onTableStacks = function() {
var a = {
0: [],
1: []
}, i = App.current_user.isPlaying(), n = i ? App.current_user.get("index") : 0;
_.each(this.state, function(e, t) {
t.match(/stack_ontable_/) && (App.game.read("hs.stacks")[t].owner % 2 == n % 2 ? a[0].push([ t, e.length ]) : a[1].push([ t, e.length ]));
});
var r = {};
return _.each(a, function(e, n) {
var t = _.sortBy(e, function(e) {
return e[1];
}).reverse(), a = fillRow(t);
_.each(a, function(e, t) {
var a = 20;
_.each(e, function(e) {
r[e[0]] = {
top: ("1" === n ? 20 : 200) + (0 === t ? 0 : 50),
left: a,
minW: 10,
maxW: 17 * e[1],
cardWidth: 22,
cardHeight: 40,
canHover: i && "0" === n,
canDrop: i && "0" === n,
stacker: {
dm: 17,
dd: 25
},
anchor: "left",
cardClass: i && "1" === n ? "opponent-on-table" : ""
}, a += 8 + 17 * e[1];
});
});
}), r;
}, NApp.Banakil.orderingStacks = function() {
var s = {};
return App.current_user.isWatcher() || _.times(5, function(e) {
var t, a = "ordering_" + e, n = NApp.Banakil.validMeld(this.state[a]), i = 0 < n;
i && (t = [ "<i class='fa fa-check clickable' data-action='goDown'></i>", "<span>" + n + "</span>" ]);
var r = "ordering " + (i ? "valid" : "");
s[a] = {
top: 350,
left: 20 + 115 * e,
minW: 110,
maxW: 110,
klass: r,
cardWidth: 30,
cardHeight: 45,
stacker: {
dm: 18,
dd: 25
},
zIndex: 200,
canHover: !0,
canDrop: !0,
canDrag: !0,
onDragOver: {
klass: r + " dragging-over"
},
options: t
};
}, this), s;
}, NApp.Banakil.positions = [ {
top: 360,
left: 250,
minW: 10,
maxW: 200,
cardHeight: 10
}, {
top: 200,
left: 470,
rotate: -90,
orientation: "v",
minW: 10,
maxW: 200,
cardHeight: 10
}, {
top: 0,
left: 250,
rotate: 180,
minW: 10,
maxW: 200,
cardHeight: 10
}, {
top: 200,
left: -22,
rotate: 90,
orientation: "v",
minW: 10,
maxW: 200,
cardHeight: 10
} ], NApp.Banakil.recordingPositions = [ {
top: 330,
left: 250,
minW: 10,
maxW: 400,
cardHeight: 40
}, {
top: 200,
left: 470,
rotate: 90,
orientation: "v",
minW: 10,
maxW: 400,
cardHeight: 40
}, {
top: -20,
left: 250,
rotate: 0,
minW: 10,
maxW: 400,
cardHeight: 40
}, {
top: 200,
left: -27,
rotate: 90,
orientation: "v",
minW: 10,
maxW: 400,
cardHeight: 40
} ], NApp.myStackName = function() {
if (App.current_user.isPlaying()) return "stack_p_" + App.current_user.get("index");
}, NApp.Banakil.stacksState = function() {
var e = App.current_user.isPlaying(), t = App.current_user.get("index"), a = App.game.iHaveTurn(), n = App.BanakilGame.iStabbed(), i = NApp.Banakil[App.game.isRecordedGame() ? "recordingPositions" : "positions"], r = {};
_.times(4, function(e) {
r["stack_p_" + e] = i[(e - t + 4) % 4];
}), e && _.extend(r["stack_p_" + t], {
top: 300,
minW: 100,
maxW: 450,
canHover: !0,
canDrop: !0,
canDrag: !0,
cardHeight: 72,
klass: "player-stack",
onDragOver: {
klass: "player-stack dragging-over"
}
});
var s = [ "<i class='fa fa-arrow-down'></i><span>" + G._("banakil_take") + "</span>" ], o = a && !n ? s : null;
r.stack_deck = {
top: 120,
left: 170,
rotate: 0,
minW: 52,
maxW: 70,
cardHeight: 72,
cardWidth: 52,
canDrag: a,
options: o
};
var p = [ "<i class='fa fa-arrow-down'></i><span>" + G._("banakil_throw") + "</span>" ], c = a && !n ? s : a && n ? p : null;
r.stack_table_fire = {
top: 120,
left: 320,
minW: 52,
maxW: 70,
cardHeight: 72,
cardWidth: 52,
onHover: {
maxW: 200
},
canHover: e,
canDrag: a,
canDrop: a,
noHoverOnDrag: !0,
options: c
}, _.extend(r, NApp.Banakil.onTableStacks(), NApp.Banakil.orderingStacks());
var d = {
orientation: "h",
rotate: 0,
cardHeight: 72,
cardWidth: 53,
stacker: {
dm: 25,
dd: 40
},
anchor: "center",
zIndex: 0,
canHover: !1,
canDrag: !1,
canDrop: !1,
klass: "",
onHover: {},
onDragOver: {
klass: "dragging-over"
}
};
return _.inject(r, function(e, t, a) {
return e[a] = _.extend({}, d, t), e[a].cards = NApp.Banakil.state[a], e[a].name = a, 
e;
}, {});
}, NApp.Banakil.onCardDrop = function(e) {
var t = !1, a = NApp.myStackName(), n = e.fromStack === a || e.fromStack.match(/ordering_/), i = e.toStack === a || e.toStack.match(/ordering_/);
"stack_deck" === e.fromStack && i ? App.game.iHaveTurn() && !App.BanakilGame.iStabbed() && (App.comm.sendGame("take_card", {
stack: "stack_deck"
}), t = NApp.Banakil.player_stabbed[App.game.getActingIndex()] = !0) : "stack_table_fire" === e.toStack && n ? App.game.iHaveTurn() && App.BanakilGame.iStabbed() && (App.comm.sendGame("move", {
card: e.cardId,
from_name: a,
to_name: "stack_table_fire"
}), t = !0) : "stack_table_fire" === e.fromStack && i ? App.game.iHaveTurn() && !App.BanakilGame.iStabbed() && (App.comm.sendGame("take_from_tf", {
card: e.cardId
}), t = NApp.Banakil.player_stabbed[App.game.getActingIndex()] = !0) : n && e.toStack.match(/ordering_/) ? this.state[e.toStack].length < 6 && (t = !0) : n && e.toStack === a ? t = !0 : n && e.toStack.match(/stack_ontable_/) ? App.game.iHaveTurn() && (App.comm.sendGame("add_to_ontable", {
card: e.cardId,
from_name: a,
to_name: e.toStack,
card_index: e.toIndex
}), t = !0) : "stack_table_fire" === e.fromStack && e.toStack.match(/stack_ontable_/) && App.game.iHaveTurn() && !App.BanakilGame.iStabbed() && (App.comm.sendGame("take_from_tf", {
card: e.cardId
}), NApp.Banakil.player_stabbed[App.game.getActingIndex()] = !0, NApp.moveCard(e.fromStack, a, e.cardId, 0), 
App.comm.sendGame("add_to_ontable", {
card: e.cardId,
from_name: a,
to_name: e.toStack,
card_index: e.toIndex
}), t = !0), t && NApp.moveCard(e.fromStack, e.toStack, e.cardId, e.toIndex);
}, NApp.moveCard = function(e, t, a, n) {
var i = NApp.findCardIndex(e, a), r = NApp.Banakil.state, s = r[e].splice(i, 1)[0];
r[t].splice(n, 0, s), NApp.Banakil.saveOrder();
}, NApp.findCardIndex = function(e, a) {
var n;
return _.find(NApp.Banakil.state[e], function(e, t) {
if (e.id === a) return n = t, !0;
}), n;
}, App.BanakilGame.GameSeatClass = App.GameSeat.extend({}, {
loadStacks: function() {}
}), App.BanakilGame.SeatViewClass = App.SeatView.extend({}, {
renderStacks: function() {}
}), NApp.getCardClass = function(e) {
var t;
if (53 === e) t = "card face-up joker-black"; else if (52 === e) t = "card face-up joker-red"; else if (-1 < e) {
t = "card face-up " + App.Card.Suits[parseInt(e % 54 / 13, 10)].toLowerCase().slice(0, -1) + "-" + App.Card.Ranks[e % 54 % 13];
} else t = "card";
return t;
}, App.BanakilGame.classBind("change:gs:state", function() {
this.inState("in_hand") && ($(".card-stack").remove(), $(".card").remove(), $(".stack").remove(), 
App.CardsManager.mount());
}), App.BanakilGame.classBind("change:gs:hs:stacks", function() {
NApp.Banakil.updateState(App.game.get("gs")), App.CardsManager.updateCards();
}), App.BanakilGame.classBind("revertIllegalMove", function() {
NApp.Banakil.updateState(App.game.get("gs")), App.CardsManager.updateCards();
}), NApp.Banakil.getGroups = function() {
return _.inject(this.state, function(e, t, a) {
return a.match(/ordering_/) && (e[a] = t), e;
}, {});
}, NApp.Banakil.onCardClick = function(e) {
if (App.game.iHaveTurn()) {
var t, a, n = NApp.myStackName();
e.stack === n ? App.BanakilGame.iStabbed() && (App.comm.sendGame("move", {
card: e.cardId,
from_name: n,
to_name: "stack_table_fire"
}), t = "stack_table_fire", a = NApp.Banakil.state[t].length) : "stack_deck" === e.stack ? App.BanakilGame.iStabbed() || (App.comm.sendGame("take_card", {
stack: "stack_deck"
}), NApp.Banakil.player_stabbed[App.game.getActingIndex()] = !0, t = n, a = NApp.Banakil.state[t].length) : "stack_table_fire" === e.stack && (App.BanakilGame.iStabbed() || (App.comm.sendGame("take_from_tf", {
card: e.cardId
}), NApp.Banakil.player_stabbed[App.game.getActingIndex()] = !0, t = n, a = NApp.Banakil.state[t].length)), 
t && (NApp.moveCard(e.stack, t, e.cardId, a), App.CardsManager.updateCards());
}
}, App.BanakilGame.classBind("started", function() {
_.each([ "1_kart", "2_kart", "3_kart", "hand", "tanzeel", "tarkeeb" ], function(e) {
App.sound.load("handgame_" + e, "/media/handgame_" + e + ".mp3");
});
}), App.BanakilGame.classBind("change:gs:hs:stacks", function() {
App.sound.play("card_played");
}), NApp.Banakil.onOptionClick = function(e) {
if ("goDown" === e.action) {
var t = _.pluck(NApp.Banakil.state[e.stack], "id");
App.comm.sendGame("go_down", {
groups: [ t ]
});
}
}, App.CardsManager = {
draggedCardId: null,
propCache: {},
eCache: {},
calculateCardsProperties: function() {
var r = [];
return _.each(NApp.Banakil.stacksState(), function(a) {
var n = ("h" === a.orientation ? NApp.horizontalStacker : NApp.verticalStacker)(a, this.draggedCardId), i = 0;
_.each(a.cards, function(e) {
if (e.id === this.draggedCardId) {
var t = {
zIndex: 1e3,
width: 53,
height: 72,
"-webkit-transform": "rotate(0deg)",
transform: "rotate(0deg)"
};
r.push(_.extend({}, e, {
style: t,
klass: "transi",
stack: a.name
}));
} else r.push(_.extend({}, e, {
style: n.cards[i],
klass: a.cardClass,
orientation: a.orientation,
stack: a.name
})), i += 1;
}, this), n.dropLoc && _.isNumber(this.draggedCardId) && (this.dropLoc = n.dropLoc);
}, this), r;
},
calculateStacksProperties: function() {
var a = [];
return _.each(NApp.Banakil.stacksState(), function(e) {
var t = ("h" === e.orientation ? NApp.horizontalStacker : NApp.verticalStacker)(e, this.draggedCardId);
a.push(_.extend({}, e, {
w: t.w,
h: t.h,
id: e.name
}));
}, this), a;
},
updateCards: function() {
var e = this.calculateCardsProperties();
this.eCache.container || (this.eCache.container = $("#cards-canvas"));
var a = this.eCache.container;
_.each(e, function(e) {
var t = this.eCache[e.id];
t || (t = $("<div id='c-" + e.id + "'><div class='face'></div><div class='back'></div></div>"), 
a.append(t), this.eCache[e.id] = t), _.isEqual(this.propCache[e.id], e) || (t.attr("class", NApp.getCardClass(e.val) + " " + e.klass).css(e.style), 
this.propCache[e.id] = e);
}, this), this.updateStacks();
},
updateStacks: function() {
var e = this.calculateStacksProperties(), p = this.eCache.container;
_.each(e, function(e) {
var t = _.isNumber(App.CardsManager.draggedCardId) && e.canDrop, a = e;
NApp.hoveredStack === a.name && t && (a = _.extend({}, a, a.onDragOver));
var n, i, r = this.eCache[a.id];
if (r || (r = $("<div id='stack-" + a.id + "'><div class='options'></div></div>"), 
p.append(r), this.eCache[a.id] = r), "h" === a.orientation) {
var s = a.options ? 14 : 0;
i = "center" === a.anchor ? a.w / 2 : 0, n = {
left: a.left - i,
top: a.top - s,
width: a.w,
height: a.h + s,
zIndex: a.zIndex
};
} else {
var o = a.cardWidth / 2 - a.cardHeight / 2;
i = "center" === a.anchor ? a.h / 2 : 0, n = {
left: a.left + o,
top: a.top - i - o,
width: a.w,
height: a.h
};
}
_.isEqual(this.propCache[a.id], a) || (r.attr("class", "stack " + a.klass).css(n), 
r.find(".options").html(a.options ? a.options.join("") : ""), this.propCache[a.id] = a);
}, this);
},
cardMouseMove: function(e) {
var t = parseInt($(this).attr("id").split("-")[1], 10), a = App.CardsManager.propCache[t], n = a.style.index, i = $(this).offset(), r = e.pageX - i.left, s = e.pageY - i.top, o = "h" === a.orientation ? r : s;
NApp.hoveredStack !== a.stack && (NApp.centerIndex = null, NApp.firstCard = !1, 
NApp.hoveredCardIndex = null), n === NApp.centerIndex + 1 ? 15 < o && (NApp.centerIndex = n, 
NApp.hoveredCardIndex = n) : o < 7 ? (NApp.centerIndex = n, NApp.hoveredCardIndex = n - 1, 
NApp.firstCard = 0 === n, 0 === n && (NApp.hoveredCardIndex = -1)) : NApp.hoveredCardIndex = n, 
!_.isNumber(NApp.hoveredCardIndex) && _.isNumber(NApp.centerIndex) && (NApp.hoveredCardIndex = NApp.centerIndex), 
!_.isNumber(NApp.centerIndex) && _.isNumber(NApp.hoveredCardIndex) && (NApp.centerIndex = NApp.hoveredCardIndex), 
NApp.hoveredStack = a.stack, App.CardsManager.updateCards();
},
cardMouseDown: function(e) {
e.preventDefault();
var t = parseInt($(this).attr("id").split("-")[1], 10), a = App.CardsManager.propCache[t];
App.CardsManager.propCache[a.stack].canDrag && (App.CardsManager.draggedCardId = t);
},
cardClick: function(e) {
e.preventDefault();
var t = parseInt($(this).attr("id").split("-")[1], 10);
NApp.Banakil.onCardClick({
cardId: t,
stack: App.CardsManager.propCache[t].stack
});
},
gameMouseMove: function(e) {
var t = {
top: e.pageY - NApp.gloc.top,
left: e.pageX - NApp.gloc.left
}, a = App.CardsManager.eCache[App.CardsManager.draggedCardId];
a && a.css({
left: t.left + 2,
top: t.top + 10
});
},
gameMouseUp: function() {
this.dropLoc && _.isNumber(this.draggedCardId) && NApp.Banakil.onCardDrop({
cardId: this.draggedCardId,
toStack: this.dropLoc.stack,
toIndex: this.dropLoc.index,
fromStack: this.propCache[this.draggedCardId].stack
}), this.dropLoc = null, this.draggedCardId = null, this.updateCards();
},
stackMouseEnter: function() {
var e = $(this).attr("id").split("-")[1];
NApp.hoveredStack = e, App.CardsManager.updateCards();
},
stackMouseLeave: function() {
NApp.hoveredStack = null, App.CardsManager.updateCards();
},
stackOptionsClick: function() {
var e = $(this).closest(".stack").attr("id").split("-")[1];
NApp.Banakil.onOptionClick({
stack: e,
action: $(this).data("action")
});
},
reset: function() {
App.CardsManager.propCache = {}, App.CardsManager.eCache = {}, NApp.Banakil.state = {}, 
NApp.Banakil.restoreOrder(), NApp.Banakil.updateState(App.game.get("gs")), App.CardsManager.updateCards();
},
mount: function() {
this.reset(), $("#cards-canvas").off(), NApp.gloc = $("#cards-canvas").offset(), 
$("#game-body").on("mousemove", App.CardsManager.gameMouseMove), $("#game-body").on("mouseup", _.bind(App.CardsManager.gameMouseUp, App.CardsManager)), 
$("#cards-canvas").on("mousemove", ".card", App.CardsManager.cardMouseMove), $("#cards-canvas").on("mousedown", ".card", App.CardsManager.cardMouseDown), 
$("#cards-canvas").on("click", ".card", App.CardsManager.cardClick), $("#cards-canvas").on("mouseenter", ".stack", App.CardsManager.stackMouseEnter), 
$("#cards-canvas").on("mouseleave", ".stack", App.CardsManager.stackMouseLeave), 
$("#cards-canvas").on("click", ".stack .options .clickable", App.CardsManager.stackOptionsClick), 
$("#cards-canvas").on("mousemove", function(e) {
"cards-canvas" === $(e.target).attr("id") && NApp.centerIndex && (NApp.hoveredStack = null, 
NApp.hoveredCardIndex = null, NApp.centerIndex = null, App.CardsManager.dropLoc = null, 
App.CardsManager.updateCards());
});
}
}, App.BanakilGame.gameSummaryInfo = function() {
var e = [];
return e.push({
label: G._("Round"),
value: parseInt(App.game.read("round"), 10) + 1
}), e;
}, NApp.maxDx = 20, NApp.getSpacing = function(e, t, a) {
var n = NApp.maxDx;
if (1 < e && a) {
var i = (a - t) / (e - 1);
n = _.min([ NApp.maxDx, i ]);
}
return n;
}, NApp.getHStackSize = function(e) {
var t = e.cards.length, a = (t - 1) * NApp.getSpacing(t, e.cardWidth, e.maxW) + e.cardWidth, n = e.cardHeight;
return e.minW && (a = _.max([ a, e.minW ])), {
w: a,
h: n
};
}, NApp.horizontalStacker = function(e, t) {
var a = _.isNumber(t) && e.canDrop, n = e;
NApp.hoveredStack !== n.name || a || (n = _.extend({}, n, n.onHover));
var i, r, s, o, p, c = _.select(n.cards, function(e) {
return e.id !== t;
}).length, d = NApp.getSpacing(c, n.cardWidth, n.maxW), l = (c - 1) * d + n.cardWidth, u = n.cardHeight;
if (n.minW && (l = _.max([ l, n.minW ])), _.isNumber(NApp.centerIndex) && NApp.hoveredStack === n.name && n.canHover) {
i = NApp.hoveredCardIndex, o = {
stack: n.name,
index: i + 1
}, s = NApp.centerIndex, r = {}, n.noHoverOnDrag && a || (r[s - 1] = a && s - 1 === i ? n.stacker.dd : n.stacker.dm, 
r[s] = a && s === i ? n.stacker.dd : n.stacker.dm, r[s + 1] = n.stacker.dm);
var h = 0, m = 0;
_.each(r, function(e, t) {
0 <= t && t < c - 1 && (h += e, m += 1);
}), (p = a && 0 === s && NApp.firstCard && -1 === i && !n.noHoverOnDrag) && (h += 20), 
d = (n.maxW - n.cardWidth - h) / (c - m - 1), d = _.min([ NApp.maxDx, d ]);
}
for (var g = n.left - ("center" === n.anchor ? l / 2 : 0), f = [], A = 0; A < c; A++) 0 === A && p && (g += 20), 
f.push({
left: g,
top: n.top,
zIndex: n.zIndex + A + 1,
index: A,
width: n.cardWidth,
height: n.cardHeight,
"-webkit-transform": "rotate(" + n.rotate + "deg)",
transform: "rotate(" + n.rotate + "deg)"
}), r && r[A] ? g += r[A] : g += d;
return NApp.hoveredStack !== n.name || o || (o = {
stack: n.name,
index: c
}, NApp.centerIndex = null, NApp.hoveredCardIndex = null), {
cards: f,
w: l,
h: u,
dropLoc: o
};
}, App.BanakilGame.noLastRound = !0, App.BanakilGame.iStabbed = function() {
return NApp.Banakil.player_stabbed[App.game.getActingIndex()];
}, NApp.Banakil.saveOrderKey = function() {
return App.game.read("id") + "-" + App.game.player_id + "-" + App.game.player_index + "-" + App.game.read("round");
}, NApp.Banakil.saveOrder = function() {
var e = _.inject(NApp.Banakil.state, function(e, t, a) {
return (a === NApp.myStackName() || a.match(/ordering_/)) && (e[a] = t), e;
}, {}), t = NApp.Banakil.saveOrderKey();
$.jStorage.set(t, e), $.jStorage.setTTL(t, 36e5);
}, NApp.Banakil.restoreOrder = function() {
NApp.Banakil.state = $.jStorage.get(NApp.Banakil.saveOrderKey(), {});
}, App.BanakilGame.iAmPartnerChooser = App.TarneebGame.iAmPartnerChooser, App.BanakilGame.iAmPartnerAccepter = App.TarneebGame.iAmPartnerAccepter, 
NApp.Banakil.validMeld = function(t) {
if (t.length < 3) return 0;
if (_.uniq(_.map(_.pluck(t, "val"), function(e) {
return e % 54;
})).length !== t.length) return 0;
var a = function(e) {
return parseInt(e.val % 54 / 13, 10);
}, n = function(e) {
return e.val % 54 % 13;
}, i = function(e) {
return 4 === a(e) ? 4 : 1 <= n(e) && n(e) <= 4 ? .5 : 0 === n(e) ? 2 : 1;
}, r = _.map(t, function(e) {
return 4 === a(e) || 0 === n(e) ? null : n(e);
}), e = _.select(t, function(e) {
return 4 === a(e);
}), s = _.select(t, function(e) {
return 0 === n(e) && 4 !== a(e);
});
if (1 < e.length || 1 < s.length) return 0;
_.select(t, function(e) {
return 4 === a(e) || 0 === n(e);
}), _.difference(t, e);
var o, p = _.difference(t, e, s), c = 1 === _.uniq(_.map(p, function(e) {
return a(e);
})).length, d = _.uniq(_.select(r, function(e) {
return null !== e;
}));
if (!c && (1 !== d.length || !_.include([ 1, 12 ], d[0]) || 0 < s.length)) return 0;
var l = _.select(r, function(e) {
return null !== e;
})[0];
if (c && 1 <= p.length) {
var u = _.map(_.range(0, 14 - t.length), function(e) {
return _.range(e, e + t.length);
});
u.unshift(_.flatten([ _.range(1, t.length - 1) ])), o = (o = _.select(u, function(e) {
return _.include(e, l);
})).concat(_.map(o, function(e) {
return _.clone(e).reverse();
}));
} else o = t.length <= 4 ? _.map(_.range(t.length), function() {
return l;
}) : [];
return _.find(o, function(e) {
return _.all(_.map(e, function(e, t) {
return r[t] === e || null === r[t];
}), _.identity);
}) ? _.inject(t, function(e, t) {
return e + i(t);
}, 0) : 0;
}, NApp.Banakil.cardsSum = function(a) {
for (var n = {
8: 10,
9: 10,
10: 10,
11: 10,
12: 11
}, e = 0; e < 8; e++) n[e] = e + 2;
if (a.length < 3) return 0;
if (_.uniq(a).length !== a.length) return 0;
if (1 < _.intersect(a, [ 52, 53 ]).length) return 0;
var t = _.select(a, function(e) {
return 52 !== e && 53 !== e;
}), i = _.map(t, function(e) {
return e % 13;
}), r = _.map(t, function(e) {
return parseInt(e / 13, 10);
}), s = 0;
if (1 === _.uniq(r).length && 1 < t.length) {
var o = _.map(_.range(0, 14 - a.length), function(e) {
return _.range(e, e + a.length);
});
o.unshift(_.flatten([ _.range(1, a.length - 1) ]));
var p = [];
if (_.each(_.select(o, function(e) {
return -1 !== _.indexOf(e, i[0]);
}), function(e) {
_.each([ e, _.clone(e).reverse() ], function(e) {
var t = _.map(_.zip(a, e), function(e) {
return 52 === e[0] || 53 === e[0] || e[0] % 13 === e[1];
});
_.all(t, _.identity) && p.push(e);
});
}), !p.length) return 0;
s = _.inject(_.last(p), function(e, t) {
return e + n[t];
}, 0);
} else {
if (1 !== _.uniq(i).length) return 0;
if (4 < a.length) return 0;
s = n[i[0]] * a.length;
}
return s;
}, App.BanakilGame.scoresTabExtension = {
gameWinner: function(e) {
var t = App.game.scores();
return t[e] === _.max(t) && _.without(t, t[e]).length === t.length - 1;
},
roundWinner: function(e, t, a) {
return e[1] === a;
}
}, NApp.maxDx = 20, NApp.getSpacing = function(e, t, a) {
var n = NApp.maxDx;
if (1 < e && a) {
var i = (a - t) / (e - 1);
n = _.min([ NApp.maxDx, i ]);
}
return n;
}, NApp.verticalStacker = function(e, t) {
var a = _.isNumber(t) && e.canDrop, n = e;
NApp.hoveredStack !== n.name || a || (n = _.extend({}, n, n.onHover));
var i, r, s, o, p, c = _.select(n.cards, function(e) {
return e.id !== t;
}).length, d = NApp.getSpacing(c, n.cardWidth, n.maxW), l = (c - 1) * d + n.cardWidth, u = n.cardHeight;
if (n.minW && (l = _.max([ l, n.minW ])), _.isNumber(NApp.centerIndex) && NApp.hoveredStack === n.name && n.canHover) {
i = NApp.hoveredCardIndex, o = {
stack: n.name,
index: i + 1
}, s = NApp.centerIndex, r = {}, n.noHoverOnDrag && a || (r[s - 1] = a && s - 1 === i ? n.stacker.dd : n.stacker.dm, 
r[s] = a && s === i ? n.stacker.dd : n.stacker.dm, r[s + 1] = n.stacker.dm);
var h = 0, m = 0;
_.each(r, function(e, t) {
0 <= t && t < c - 1 && (h += e, m += 1);
}), (p = a && 0 === s && NApp.firstCard && -1 === i && !n.noHoverOnDrag) && (h += 20), 
d = (n.maxW - n.cardWidth - h) / (c - m - 1), d = _.min([ NApp.maxDx, d ]);
}
for (var g = n.top - ("center" === n.anchor ? l / 2 : 0), f = [], A = 0; A < c; A++) 0 === A && p && (g += 20), 
f.push({
left: n.left,
top: g,
zIndex: n.zIndex + A + 1,
index: A,
width: n.cardWidth,
height: n.cardHeight,
"-webkit-transform": "rotate(" + n.rotate + "deg)",
transform: "rotate(" + n.rotate + "deg)"
}), r && r[A] ? g += r[A] : g += d;
return 0 === c && NApp.hoveredStack === n.name && (o = {
stack: n.name,
index: 0
}, NApp.centerIndex = null, NApp.hoveredCardIndex = null), {
cards: f,
w: u,
h: l,
dropLoc: o
};
}, App.HandPartnerGame = App.CardGame.newGameHash(App.HandgameGame), App.HandPartnerGame.iAmPartnerChooser = App.TarneebGame.iAmPartnerChooser, 
App.HandPartnerGame.iAmPartnerAccepter = App.TarneebGame.iAmPartnerAccepter, App.HandPartnerGame.scoresTabExtension = {
gameWinner: function(e) {
var t = App.game.scores();
return t[e] === _.min(t) && _.without(t, t[e]).length === t.length - 1;
},
roundWinner: function(e, t, a) {
if (0 < t) {
var n = App.game.read("track_scores")[t - 1];
return e[0][a] < n[0][a];
}
return e[0][a] < 0;
}
}, App.HandSaudiGame = App.CardGame.newGameHash(App.HandgameGame), App.HandSaudiPartnerGame = App.CardGame.newGameHash(App.HandgameGame), 
App.HandSaudiPartnerGame.iAmPartnerChooser = App.TarneebGame.iAmPartnerChooser, 
App.HandSaudiPartnerGame.iAmPartnerAccepter = App.TarneebGame.iAmPartnerAccepter, 
App.HandSaudiPartnerGame.scoresTabExtension = {
gameWinner: function(e) {
var t = App.game.scores();
return t[e] === _.min(t) && _.without(t, t[e]).length === t.length - 1;
},
roundWinner: function(e, t, a) {
if (0 < t) {
var n = App.game.read("track_scores")[t - 1];
return e[0][a] < n[0][a];
}
return e[0][a] < 0;
}
}, App.HandSaudiPartnerNewGame = App.CardGame.newGameHash(App.HandgameGame), App.HandSaudiPartnerNewGame.iAmPartnerChooser = App.TarneebGame.iAmPartnerChooser, 
App.HandSaudiPartnerNewGame.iAmPartnerAccepter = App.TarneebGame.iAmPartnerAccepter, 
App.HandSaudiPartnerNewGame.scoresTabExtension = {
gameWinner: function(e) {
var t = App.game.scores();
return t[e] === _.min(t) && _.without(t, t[e]).length === t.length - 1;
},
roundWinner: function(e, t, a) {
if (0 < t) {
var n = App.game.read("track_scores")[t - 1];
return e[0][a] < n[0][a];
}
return e[0][a] < 0;
}
}, App.HareegaGame = App.CardGame.newGameHash(App.HandgameGame), App.HareegaGame.gameSummaryInfo = function() {
var e = [];
return e.push({
label: G._("Round"),
value: parseInt(App.game.read("round"), 10) + 1
}), e.push({
label: G._("x_points_in_pot"),
value: parseInt(App.game.read("points_pot"), 10)
}), e;
}, App.HareegaGame.playerCircleMonitoredEVs = function() {
return "change:gs:hs:scores";
}, App.HareegaGame.getPlayerCircle = function(e) {
var t = e.playerIndex(), a = G._("Points ");
return $("<div class='score' rel='tooltip' title='" + a + "'>" + this.read("overall_points." + t, 0) + "</div>");
}, App.HareegaGame.scoresTabExtension = {
gameScore: function(e) {
return App.game.read("overall_points")[e];
},
gameWinner: function(e) {
var t = App.game.read("overall_points");
return t[e] === _.max(t) && _.without(t, t[e]).length === t.length - 1;
},
preGameRound: function() {
return [];
},
roundHeader: function() {},
roundDetails: function(a, e) {
return -1 === e ? {
summaryHeader: G._("Total"),
details: [ {
name: G._("Score"),
data: _.map(_.range(0, App.game.read("num_players")), function() {
return 0;
})
} ]
} : a ? {
summaryHeader: G._("Total"),
details: [ {
name: G._("Score"),
data: _.map(_.range(0, App.game.read("num_players")), function(e) {
var t = _.include(a[3], e) ? " <img src='/images/burn.png' />" : "";
return a[0][e] + t;
})
} ]
} : {};
},
roundScore: function(e, t, a) {
return -1 === t ? -App.game.read("hareega_points.entry") : App.game.read("track_points")[t][0][a];
},
roundWinner: function(e, t, a) {
return -1 !== t && e[0][a] < 0;
}
}, App.BalootGame = App.CardGame.newGameHash(), App.BalootGame.getCardClass = function(e) {
var t;
0 <= e ? t = "card face-up " + App.Card.Suits[parseInt(e % 54 / 13, 10)].toLowerCase().slice(0, -1) + "-" + App.Card.Ranks[e % 54 % 13] : t = "card empty-card";
return t;
}, App.BalootGame.classBind("change:gs started", function() {
_.each(this.seats, function(t) {
App.clearCardIcons(t);
var e = t.get("player").get("index"), a = this.read("hs.projects." + e) || [];
_.each(a, function(e) {
App.addCardIcon(t, "empty-card", G._(e), [ {
klass: "jicon-" + e,
style: "margin-left: -10px;"
} ]);
});
}, this);
}), function() {
var e = App.StackView.extend({
canPlay: function(e, t) {
if (t.get("name") !== "stack_p_" + App.game.getActingIndex() && t.get("name") !== "stack_pv_" + App.game.getActingIndex()) return !1;
if (!App.game.playerHasTurn(App.game.getActingIndex())) return !1;
if (!App.game.inState("in_hand")) return !1;
var a = App.game.stacks.stack_table;
if (!a.isUpToDate()) return !1;
if (App.game.read("qoyod_game")) return !0;
var n = App.game.stacks["stack_p_" + App.game.getActingIndex()].allCards();
if ("sun" == App.game.read("buying_hash.sheryeh")) {
if (!a.empty()) {
var i = a.get("cards").first();
if (e.suit() !== i.suit()) return !_.any(n, function(e) {
return e.suit() === i.suit();
});
}
return !0;
}
var r = App.game.read("buying_hash.hokm_suit");
if (a.empty()) {
if (App.game.read("hokm_closed") && e.suit() === r) return !_.any(n, function(e) {
return e.suit() !== r;
});
} else {
i = a.get("cards").first();
var s = a.get("cards").select(function(e) {
return e.suit() === r;
}), o = _.any(n, function(e) {
return e.suit() === r;
}), p = _.any(n, function(e) {
return e.suit() === i.suit();
});
if (e.suit() !== i.suit()) {
if (p) return !1;
if (_.isEmpty(s) && o && e.suit() !== r && !this.isPartnerEating()) return !1;
}
if (!_.isEmpty(s)) {
var c = _.last(s.sort(_.bind(function(e, t) {
return this.cardsSort(e.val(), t.val(), !0);
}, this))), d = _.filter(n, _.bind(function(e) {
return 0 < this.cardsSort(e.val(), c.val(), !0);
}, this));
return this.isPartnerEating() || _.isEmpty(d) || i.suit() !== r && p || _.contains(d, e);
}
}
return !0;
},
onClick: function(e, t) {
var a = [ "move", t.get("name"), "stack_table", e.id ];
App.commander.performCmdExternal(a), App.comm.moveCard(a[3], a[1], a[2]);
},
isPartnerEating: function() {
var e = App.game.stacks.stack_table.get("cards");
if (e.length < 2) return !1;
var t = e.first(), a = App.game.read("buying_hash.hokm_suit"), n = _.zip(e.toArray(), _.range(e.length)), i = _.filter(n, function(e) {
return e[0].suit() === t.suit() || e[0].suit() === App.game.read("buying_hash.hokm_suit");
}), r = _.last(i.sort(_.bind(function(e, t) {
return this.cardsSort(e[0].val(), t[0].val(), !0);
}, this)));
return !(r[1] !== e.length - 2) && (3 === e.length || !(2 !== e.length || (r[0].suit() === a || !App.game.read("is_ikka") && r[0].val() % 13 != 12) && r[0].suit() != a));
},
cardsSort: function(e, t, a) {
var n = [ 5, 6, 7, 9, 10, 11, 8, 12 ], i = [ 5, 6, 10, 11, 8, 12, 7, 9 ], r = "hokm" == App.game.read("buying_hash.sheryeh") ? App.game.read("buying_hash.hokm_suit") : null, s = 13 * Math.floor(e / 13), o = 13 * Math.floor(t / 13);
if (a) {
if (Math.floor(e / 13) === r && Math.floor(t / 13) === r) return _.indexOf(i, e % 13) + s - (_.indexOf(i, t % 13) + o);
if (Math.floor(e / 13) !== r && Math.floor(t / 13) !== r) return _.indexOf(n, e % 13) + s - (_.indexOf(n, t % 13) + o);
if (Math.floor(e / 13) === r) return 1;
if (Math.floor(t / 13) === r) return -1;
} else {
if (e < 0 || t < 0) return e - t;
if (Math.floor(e / 13) === r && Math.floor(t / 13) === r) return _.indexOf(i, e % 13) + s - (_.indexOf(i, t % 13) + o);
if (Math.floor(e / 13) !== r || Math.floor(t / 13) !== r) return _.indexOf(n, e % 13) + s - (_.indexOf(n, t % 13) + o);
}
}
});
App.BalootGame.stackView = function() {
return e;
};
var n = App.game.loadStacks;
App.BalootGame.loadStacks = function(e, t) {
var a = "stack_table_center";
this.stacks[a] || (this.stacks[a] = new App.CardStack({
name: a
})), this.stackViews[a] || (this.stackViews[a] = new (this.stackView())({
id: "upcards",
left: 0,
className: "card-stack face-up",
model: this.stacks[a],
parent: "#game-canvas",
closed: !0
})), this.stacks[a].readCards(), n.apply(this, arguments);
};
}(), App.BalootGame.gameSummaryInfo = function() {
var e = [];
if (this.dealer() && e.push({
label: G._("Dealer"),
value: this.dealer().name()
}), this.read("buying_hash.sheryeh") && "none" != this.read("buying_hash.sheryeh")) {
var t = ((this.read("buying_hash.sheryeh_buyer") + 1 + this.read("dealer")) % 4 + App.current_user.get("index")) % 2 == 0 ? G._("Us") : G._("Them"), a = G._(_.string.capitalize(this.read("buying_hash.sheryeh")));
if (e.push({
label: G._("Current purchase"),
value: a + " (" + t + ")"
}), _.isNumber(this.read("buying_hash.hokm_suit"))) {
var n = [ "heart", "spade", "diamond", "club" ], i = this.read("buying_hash.hokm_suit");
e.push({
label: G._("Hokum suit"),
value: G._(n[i])
});
}
}
return e;
}, App.BalootGame.playerIsBidder = function(e) {
return this.read("hs.bidder") === e;
}, App.BalootGame.playerIsBalootDoubler = function(e) {
return this.inState("doubling") && this.read("hs.doubler") === e;
}, App.BalootGame.iAmBalootDoubler = function() {
return this.read("hs.doubler") === this.getActingIndex() && !App.current_user.isWatcher();
}, App.BalootGame.iAmNextBidder = function() {
return -1 < this.read("hs.player_turn").indexOf(this.getActingIndex()) && !App.current_user.isWatcher();
}, App.BalootGame.iAmPartnerChooser = App.TarneebGame.iAmPartnerChooser, App.BalootGame.iAmPartnerAccepter = App.TarneebGame.iAmPartnerAccepter, 
App.BalootGame.playerCircleMonitoredEVs = function() {
return "change:gs:hs:bunts";
}, App.BalootGame.getPlayerCircle = function(e) {
var t = e.playerIndex(), a = this.read("hs.bunts." + t, 0), n = G._("Bunts");
return $("<div class='score' rel='tooltip' title='" + n + "'>" + a + "</div>");
}, App.BalootGame.scoresTabExtension = {
roundHeader: function(e) {
var t, a;
return e ? (t = App.game.players[e[6]].name(), a = G._(_.string.capitalize(e[7]))) : (t = G._("Buyer"), 
a = G._("Purchase")), mAmount = "", e && ("qahwa" == e[8] ? mAmount = G._("Gahwa") : "4" == e[8] ? mAmount = G._("four") : "3" == e[8] ? mAmount = G._("three") : "2" == e[8] && (mAmount = G._("double"))), 
_.string.sprintf("%s (%s %s)", t, a, mAmount);
},
roundScore: function(e, t, a) {
return e[0][a];
},
roundDetails: function(t) {
return returnVar = t ? {
summaryHeader: _.string.sprintf("%s", G._("Points")),
details: [ {
name: G._("Bunts"),
data: t[5]
}, {
name: G._("Floor"),
data: t[4]
}, {
name: G._("Projects"),
data: _.map([ 0, 1 ], function(e) {
return 0 < t[3][e].length ? " (" + _.map(t[3][e], function(e) {
return G._(e);
}).join(G._(", ")) + ")" : "";
})
} ]
} : {}, returnVar;
},
roundWinner: function(e, t, a) {
return e[0][a] > e[0][(a + 1) % 2];
}
}, App.BalootGame.classBind("started", function() {
_.each([ "arba3miya", "baloot", "pass", "club", "diamond", "double_3", "double_4", "double_4_closed", "double_4_open", "double_5", "double_2", "double_2_closed", "double_2_open", "heart", "hokum", "hokum_thani", "khamseen", "miya", "sira", "spade", "sun", "ashkal", "ikka", "wala" ], function(e) {
App.sound.load("baloot_" + e, "/media/baloot_" + e + ".mp3");
}), App.sound.load("baloot_round_1", "/media/baloot_round_1.mp3"), App.sound.load("baloot_round_2", "/media/baloot_round_2.mp3");
}), App.BalootGame.classBind("change", function() {
this.isChanged("buying_hash.round") ? (round = this.read("buying_hash.round"), App.sound.play("baloot_round_" + this.read("buying_hash.round"))) : this.isChanged("buying_hash") && App.sound.play(this.read("play_sound"));
}), App.LeftLowerBox = App.ButtonList.extend({
defaultKlass: "btn-primary",
top: !1,
numOutside: 2,
left: !1,
items: [ {
id: "inviteFriends",
name: "Invite to game",
visible: function() {
return !App.current_user.isWatcher() && "competition" !== this.model.read("game_type") && _.any(this.model.players, function(e) {
return e.isAI();
}) && !App.game.isChallengeGame();
},
onClick: function() {
App.selectFriends({
extraListNames: [ "facebook" ],
callback: function(e) {
App.User.inviteToGame(e);
},
fb_callback: function(e) {
var t = G._("fb_game_invite", {
gm: G._(App.game.gameName())
}), a = "/" + G.lang() + "/games/" + App.game.gameName().underscore();
App.FB.invite(e, {
message: t,
data: JSON.stringify({
url: a
})
});
}
});
},
monitoredEvents: [ "change:players", "change:gs:game_type" ]
}, {
id: "balootRaiseQaid",
name: G._("raise.qaid"),
visible: function() {
return !App.current_user.isWatcher() && App.game.read("qoyod_game") && App.game.gameIs("baloot");
},
onClick: function() {
var e = App.game.read("buying_hash.sheryeh");
App.Lightbox.activate({
inGame: !0,
form: !0,
klass: "form-horizontal",
title: "Choose Qaid Type (" + e + ")",
template: JST["jsts/games/baloot/select_qaid"],
footer: [ {
type: "a",
name: "Cancel",
action: "cancel"
}, {
type: "button",
name: "Raise",
action: "raise"
} ],
raise: function() {
App.comm.sendGame("qaid", {
qaid_type: this.$("#qaid_type").val()
}), this.deactivate();
}
});
}
}, {
id: "balootCallSiwa",
name: G._("baloot.siwa"),
visible: function() {
return App.game.gameIs("baloot") && !App.current_user.isWatcher();
},
onClick: function() {
App.comm.sendGame("siwa");
}
} ]
}), App.BalootBid = App.Lightbox.extend({
inGame: !0,
form: !0,
klass: "form-horizontal baloot-lb",
title: function() {
return G._([ "first_baloot_bidding_round", "second_baloot_bidding_round" ][App.game.read("hs.bidding_round") - 1]);
},
template: JST["jsts/games/baloot/bid"],
footer: JST["jsts/games/baloot/bid_footer"],
visible: function() {
return this.model.gameIs("Baloot") && this.model.inState("before_hands") && this.model.iAmNextBidder();
},
go: function() {
App.comm.sendGame("bid", {
bid: this.$("#balootBidValue").val()
}), this.deactivate();
},
pass: function() {
App.comm.sendGame("bid", {
bid: "pass"
}), this.deactivate();
},
confirmHokum: function() {
this.selectedRadioValue("hokumSuit") && (App.comm.sendGame("bid", {
bid: "hokum",
suit: this.selectedRadioValue("hokumSuit")
}), this.deactivate());
},
yeglebSun: function() {
App.comm.sendGame("bid", {
bid: "sun"
}), this.deactivate();
}
}, {
monitoredEvents: [ "change:gs:state", "change:gs:hs:player_turn" ]
}), App.BalootDouble = App.Lightbox.extend({
inGame: !0,
form: !0,
klass: "form-horizontal baloot-lb",
title: G._("Would you like to double the hand?"),
footer: JST["jsts/games/baloot/double"],
visible: function() {
return this.model.gameIs("Baloot") && this.model.inState("doubling") && this.model.iAmBalootDoubler();
},
go: function() {
App.comm.sendGame("double"), this.deactivate();
},
goClosed: function() {
App.comm.sendGame("double", {
closed: "true"
}), this.deactivate();
},
pass: function() {
App.comm.sendGame("double", {
pass: "true"
}), this.deactivate();
}
}, {
monitoredEvents: [ "change:gs:state", "change:gs:hs:doubler" ]
}), App.AddProjects = App.Lightbox.extend({
inGame: !0,
form: !0,
klass: "form-horizontal",
title: G._("Projects"),
template: JST["jsts/games/baloot/add_projects"],
footer: [ {
type: "a",
name: "No Projects",
action: "cancel"
}, {
type: "button",
name: "Add",
action: "add"
} ],
visible: function() {
return this.model.gameIs("Baloot") && this.model.inState("in_hand") && this.model.read("hs.first_playing_round") && this.model.read("hs.player_turn") == this.model.getActingIndex() && (void 0 === this.model.read("hs.players_projects") || !(this.model.getActingIndex() in this.model.read("hs.players_projects")));
},
add: function() {
2 < parseInt(this.selectedRadioValue("projectSira"), 10) + parseInt(this.selectedRadioValue("projectKhamseen"), 10) + parseInt(this.selectedRadioValue("projectMiya"), 10) + ("hokum" === this.model.read("hs.current_bid") ? 0 : parseInt(this.selectedRadioValue("projectArba3miya"), 10)) ? App.Lightbox.error(G._("You have selected more projects than those allowed.")) : App.comm.sendGame("add_project", {
sira: this.selectedRadioValue("projectSira"),
50: this.selectedRadioValue("projectKhamseen"),
100: this.selectedRadioValue("projectMiya"),
400: "hokum" === this.model.read("hs.current_bid") ? "0" : this.selectedRadioValue("projectArba3miya")
}), this.deactivate();
},
cancel: function() {
this.deactivate();
}
}, {
monitoredEvents: [ "change:gs:state", "change:gs:hs:first_playing_round", "change:gs:hs:player_turn", "change:gs:hs:players_projects" ]
}), App.BalootRoundsLB = App.Lightbox.extend({
klass: "baloot-qaid-lb",
title: G._("baloot.qaid.lb.title"),
template: JST["jsts/games/baloot/qaid"],
footer: [ {
type: "button",
name: "Submit",
action: "submit"
} ],
visible: function() {
return this.model.inState("qaid") && App.game.read("qaid_caller") === this.model.getActingIndex();
},
events: {
"click .card.selectable": "cardClick",
"click [data-action]": "runAction"
},
cardClick: function(e) {
var t = $(e.currentTarget).data("cid");
_.contains(this.cards, t) ? this.cards = _.without(this.cards, t) : this.cards.push(t), 
this.render(), this.enableSubmit();
},
enableSubmit: function() {
this.$("[data-action=submit]").attr("disabled", 2 !== this.cards.length), this.$("[data-action=siwa]").attr("disabled", !(0 <= this.model.read("hs.siwa_caller")));
},
submit: function(e) {
e.preventDefault(), App.comm.sendGame("pick", {
cards: this.cards
}), this.deactivate();
},
activate: function() {
this.cards = [], this.rounds = App.game.read("rounds_qoyod"), App.Lightbox.prototype.activate.apply(this, arguments), 
this.enableSubmit();
}
}, {
monitoredEvents: [ "change:gs:state" ]
}), App.balootBid = new App.BalootBid({
model: App.game
}), App.balootDouble = new App.BalootDouble({
model: App.game
}), App.addProjects = new App.AddProjects({
model: App.game
}), App.balootRoundsLB = new App.BalootRoundsLB({
model: App.game
}), App.BalootGame.classBind("started", function() {
this.read("game_options").qoyod && (App.gameActions.numOutside = 2, App.gameActions.addItems([ {
id: "BalootQaid",
name: "baloot.qaid.btn",
btnClasses: _.bind(function() {
return "btn-primary " + this.read("state").replace(/_/g, "-");
}, this),
visible: function() {
var t = this.model.read("state");
return this.model.gameIs("Baloot") && _.some([ "in_hand", "after_hand_qaid" ], function(e) {
return e === t;
}) && this.model.read("hs.player_turn") === this.model.getActingIndex() && !this.model.read("hs.first_playing_round");
},
onClick: function() {
App.comm.sendGame("qaid");
},
monitoredEvents: [ "change:gs" ]
}, {
id: "BalootQaidPass",
name: "Pass",
btnClasses: "after-hand-qaid",
visible: function() {
return this.model.gameIs("Baloot") && this.model.inState("after_hand_qaid") && this.model.read("hs.player_turn") === this.model.getActingIndex();
},
onClick: function() {
App.comm.sendGame("pass");
},
monitoredEvents: [ "change:gs" ]
} ]));
}), App.comm.registerCallback("balootAfterQaid", function(e) {
e.game_id === App.game.gid && App.Lightbox.activate({
klass: "baloot-qaid-lb",
optional: !0,
title: G._("baloot.qaid.lb.title"),
model: App.game,
cards: e.cards,
rounds: e.rounds,
valid: e.valid,
template: JST["jsts/games/baloot/qaid"]
});
}), App.BalootGame.classBind("change:gs", function() {
_.each(this.seats, function(e) {
var t = e.get("player"), a = t.get("index");
if (this.isChanged("hs.has_ikka." + a) && this.read("hs.has_ikka." + a, !1) && this.vaporize(a, G._("Ikka")), 
this.isChanged("hs.doubling_factor") && 1 < this.read("hs.doubling_factor")) {
var n = this.read("hs.doubling_factor");
if (t.get("index") === this.read(n % 2 ? "hs.bidder" : "hs.doubling_with")) {
var i = {
2: "Double",
3: "Double 3",
4: "Double 4",
5: "Gahwa"
};
this.vaporize(a, G._(i[n]));
}
}
}, this), this.inState("qaid") && this.vaporize(this.read("hs.player_turn"), G._("baloot.qaid.vapor"));
}), App.BalootGame.classBind("change:gs:buying_hash", function() {
last_bid = this.read("last_bid"), last_bidder = this.read("last_bidder"), last_bid && last_bidder && this.vaporize(this.read("last_bidder"), G._(this.read("last_bid")));
}), App.BasraGame = App.CardGame.newGameHash(), App.BasraGame.classBind("change:gs started", function() {
_.each(this.seats, function(e) {
App.clearCardIcons(e);
var t = e.get("player").get("index"), a = this.read("hs.num_basras." + t, 0);
a && App.addCardIcon(e, "empty-card", G._("Basra"), [ {
klass: "jicon-basra",
style: "padding: 0 15px;"
}, a ]);
}, this);
});

var BasraStack = App.StackView.extend({
findDestinationStack: function() {
return App.game.stacks.stack_t_0.get("cards").length <= App.game.stacks.stack_t_1.get("cards").length ? "stack_t_0" : "stack_t_1";
},
canPlay: function(e, t) {
return t.get("name") === "stack_p_" + App.game.getActingIndex() && (!!App.game.playerHasTurn(App.game.getActingIndex()) && (!!App.game.inState("in_hand") && (!!App.game.stacks.stack_t_0.isUpToDate() && !!App.game.stacks.stack_t_1.isUpToDate())));
},
onClick: function(e, t) {
var a = [ "move", t.get("name"), this.findDestinationStack(), e.id ];
App.commander.performCmdExternal(a), App.comm.moveCard(a[3], a[1], a[2]);
}
});

App.BasraGame.stackView = function() {
return BasraStack;
}, App.BasraGame.loadStacks = function() {
_.each(_.range(2), function(e) {
var t = "stack_t_" + e;
this.stacks[t] || (this.stacks[t] = new App.CardStack({
name: t
})), this.stackViews[t] || (this.stackViews[t] = new (this.stackView())({
tagName: "div",
className: "card-stack horizontal",
model: this.stacks[t],
top: 75 * e - 45,
ordered: !1,
parent: "#game-canvas"
})), this.stacks[t].readCards();
}, this), _.invoke(this.seats, "loadStacks");
}, App.BasraGame.gameSummaryInfo = function() {
var e = [];
if (this.read("hs.num_eaten")) {
var t = this.read("hs.num_eaten"), a = t[0] + t[1];
a += this.read("hs.stacks.stack_t_0").contains_new.length + this.read("hs.stacks.stack_t_1").contains_new.length, 
a += this.read("hs.stacks.stack_p_0").contains_new.length + this.read("hs.stacks.stack_p_1").contains_new.length, 
e.push({
label: G._("Cards Left"),
value: 52 - a
});
}
return e;
}, App.BasraGame.playerCircleMonitoredEVs = function() {
return "change:gs:hs:num_eaten";
}, App.BasraGame.getPlayerCircle = function(e) {
var t = e.playerIndex(), a = "", n = this.read("hs.num_eaten." + t, 0);
n && (26 < n ? a = "positive" : 26 < this.read("hs.num_eaten." + (t + 1) % 2, 0) && (a = "negative"));
var i = G._("Number Of Cards Eaten"), r = $("<div class='score' rel='tooltip' title='" + i + "'>" + n + "</div>");
return r.addClass(a), r;
}, App.BasraGame.scoresTabExtension = {
roundSummary: function(e) {
return _.any(e[0]) ? null : G._("Next round is") + " x" + e[4];
},
roundDetails: function(e) {
return e ? {
summaryHeader: G._("Total"),
details: [ {
name: G._("Cards"),
data: e[3]
}, {
name: G._("Score"),
data: e[0]
}, {
name: G._("Bonus"),
data: e[1]
}, {
name: G._("Basra"),
data: e[2]
} ]
} : {};
},
roundScore: function(e, t, a) {
return e[0][a] + e[1][a] + e[2][a];
},
roundWinner: function(e, t, a) {
return this.roundScore(e, t, a) > this.roundScore(e, t, 1 - a);
}
}, App.BasraGame.classBind("started", function() {
App.sound.load("basra", "/media/basra.mp3");
}), App.BasraGame.classBind("change", function() {
"in_hand" === this.readOld("state") && this.isChanged("hs.num_basras") && App.sound.play("basra");
}), App.HokmGame = App.CardGame.newGameHash(), App.HokmGame.classBind("change:gs", function() {
var e = this.read("hakem_index");
this.isChanged("hakem_index") ? _.delay(function() {
App.game.vaporize(e, G._("Hakem"));
}, 200) : this.isChanged("hs.tarneeb") && this.read("hs.tarneeb") && this.vaporize(e, G._(App.Card.Suits[this.read("hs.tarneeb")]));
}), App.HokmGame.classBind("change:gs started", function() {
_.each(this.seats, function(e) {
App.clearCardIcons(e);
var t = e.get("player").get("index"), a = [ "nosuit", "heart", "spade", "diamond", "club" ][this.read("hs.tarneeb", -1) + 1];
this.playerIsHakem(t) && App.addCardIcon(e, a + "-7", G._("The Bid"), [ {
klass: "fa fa-legal",
style: "padding: 0 18px;"
} ]);
}, this);
}), App.HokmGame.stackView = function() {
return App.TarneebGame.TarneebStack;
}, App.HokmGame.gameSummaryInfo = function() {
var e = [], t = App.game.read("hs.tarneeb");
if (_.isNumber(t)) {
var a = [ "Hearts", "Spades", "Diamonds", "Clubs" ], n = App.game.players[App.game.read("hakem_index")].name();
e.push({
label: G._("Hokm"),
value: G._(a[t])
}), e.push({
label: G._("Hakem"),
value: n
});
}
return e;
}, App.HokmGame.playerIsHakem = function(e) {
return this.read("hakem_index") === e;
}, App.HokmGame.iAmHakem = function() {
return this.read("hakem_index") === this.getActingIndex() && !App.current_user.isWatcher();
}, App.HokmGame.chooseTrumpText = function() {
return G._("Choose your hokm");
}, App.HokmGame.playerCircleMonitoredEVs = function() {
return "change:gs:hs:num_eaten";
}, App.HokmGame.getPlayerCircle = function(e) {
var t = e.playerIndex(), a = "", n = this, i = _.inject([ t, (t + 2) % 4 ], function(e, t) {
return e + n.read("hs.num_eaten." + t, 0);
}, 0);
if (this.playerIsHakem(t) || this.playerIsHakem((t + 2) % 4)) {
var r = _.inject([ (t + 1) % 4, (t + 3) % 4 ], function(e, t) {
return e + n.read("hs.num_eaten." + t, 0);
}, 0), s = 7;
s <= i ? a = "positive" : 13 - r < s && (a = "negative");
}
var o = G._("Eaten cards"), p = $("<div class='score' rel='tooltip' title='" + o + "'>" + this.read("hs.num_eaten." + t, 0) + "</div>");
return p.addClass(a), p;
}, App.HokmGame.scoresTabExtension = {
roundHeader: function(e) {
return e ? App.game.players[e[1]].name() : G._("Hakem");
},
roundWinner: function(e, t, a) {
return e[1] % 2 === (e[2] ? a : 1 - a);
}
}, App.HokmGame.classBind("started", function() {
_.each(App.Card.RealSuits, function(e, t) {
App.sound.load("suit_" + t, "/media/general_" + e.toLowerCase() + "_" + G.lang().toLowerCase() + ".mp3");
});
}), App.HokmGame.classBind("change", function() {
"hand_more" === this.readOld("state") && this.hasKey("hs.tarneeb") && App.sound.play("suit_" + this.read("hs.tarneeb"));
}), App.HokmTarneebChoose = App.Lightbox.extend({
inGame: !0,
form: !0,
klass: "form-horizontal",
title: G._("Hokm"),
template: JST["jsts/games/tarneeb/tarneeb"],
footer: [ {
type: "button",
name: "Choose",
action: "tarneebGo"
} ],
visible: function() {
return "Hokm" === this.model.gameName() && this.model.inState("hand_more") && App.game.read("hakem_index") === App.game.getActingIndex() && !App.current_user.isWatcher();
},
tarneebGo: function() {
this.selectedRadioValue("tarneebSuit") && (App.comm.sendGame("tarneeb", {
tarneeb: this.selectedRadioValue("tarneebSuit")
}), this.deactivate());
}
}, {
monitoredEvents: [ "change:gs:state" ]
}), App.hokmTarneebChoose = new App.HokmTarneebChoose({
model: App.game
}), App.KoutBo4Game = App.CardGame.newGameHash(App.TarneebGame), App.KoutBo4Game.KoutStack = App.StackView.extend({
canPlay: function(e, t) {
if (t.owner() !== App.game.getActingIndex()) return !1;
if (!App.game.playerHasTurn(App.game.getActingIndex())) return !1;
if (!App.game.inState("in_hand")) return !1;
var a, n = App.game.stacks.stack_table;
return !!n.isUpToDate() && !(!n.empty() && !e.isJoker() && (a = n.get("cards").first().suit()) !== e.suit() && _.any(t.get("cards").map(function(e) {
return e.suit() === a;
}), _.identity));
},
onClick: function(e, t) {
var a = [ "move", t.get("name"), "stack_table", e.id ];
App.commander.performCmdExternal(a), App.comm.moveCard(a[3], a[1], a[2]);
}
}), App.KoutBo4Game.stackView = function() {
return App.KoutBo4Game.KoutStack;
}, App.KoutBo4Game.playerIsBidder = function(e) {
return this.read("hs.bidder") === e;
}, App.KoutBo4Game.iAmNextBidder = function() {
return this.read("hs.next_bidder") === this.getActingIndex() && !App.current_user.isWatcher();
}, App.KoutBo4Game.iAmBidder = function() {
return this.read("hs.bidder") === this.getActingIndex() && !App.current_user.isWatcher();
}, App.KoutBo4Game.bidText = function(e) {
return 5 === e ? _.select(this.read("hs.finished_bidding"), _.identity).length === this.read("num_players") - 1 && 0 === this.read("hs.bid") ? G._("kout.malzoom") : this.read("hs.forced_to_bid") ? G._("kout.malzoom") : G._("kout.bab") : 9 === e ? G._("kout.bawn") : e;
}, App.KoutBo4Game.passText = function() {
return G._("kout.pass");
}, App.KoutBo4Game.trumpText = function() {
return G._("Hokm");
}, App.KoutBo4Game.suitText = function(e) {
var t = [ "Kout_Hearts", "Kout_Spades", "Kout_Diamonds", "Kout_Clubs" ];
return G._(t[e]);
}, App.KoutBo4Game.chooseTrumpText = function() {
return G._("Choose your hokm");
}, App.KoutBo4Game.classBind("started", function() {
_.each([ "bab", "malzoom", "bawn" ], function(e) {
App.sound.load("kout_" + e, "/media/kout_" + e + ".mp3");
});
for (var e = 6; e < 9; e++) App.sound.load("tarneeb_" + e, "/media/tarneeb_" + e + "_" + G.lang().toLowerCase() + ".mp3");
_.each(App.Card.RealSuits, function(e, t) {
App.sound.load("kout_" + t, "/media/kout_" + e.toLowerCase() + "_" + G.lang().toLowerCase() + ".mp3");
}), App.sound.load("general_pass", "/media/kout_pass_" + G.lang().toLowerCase() + ".mp3");
}), App.KoutBo4Game.classBind("change:gs", function() {
if ("hand_more" === this.readOld("state")) if (_.all(this.readOld("hs.finished_bidding"), _.identity) && this.hasKey("hs.tarneeb")) App.sound.play("kout_" + this.read("hs.tarneeb")); else if (this.isChanged("hs.bid")) {
var e;
switch (this.read("hs.bid")) {
case 5:
e = this.read("hs.forced_to_bid") ? "kout_malzoom" : "kout_bab";
break;

case 9:
e = "kout_bawn";
break;

default:
e = "tarneeb_" + this.read("hs.bid").toString();
}
App.sound.play(e);
} else this.isChanged("hs.finished_bidding") && App.sound.play("general_pass");
}, "tarneeb-sound"), App.KoutBo6Game = App.CardGame.newGameHash(App.KoutBo4Game), 
App.Tarneeb400Game = App.CardGame.newGameHash(), App.Tarneeb400Game.classBind("change:gs", function() {
"hand_more" === this.readOld("state") && _.each(this.read("hs.bids"), function(e, t) {
this.isChanged("hs.bids." + t) && this.vaporize(t, e.toString());
}, this);
}), App.Tarneeb400Game.classBind("change:gs started", function() {
_.each(this.seats, function(e) {
App.clearCardIcons(e);
var t = e.get("player").get("index"), a = this.read("hs.bids", [])[t], n = [ "heart", "spade", "diamond", "club" ][this.read("hs.tarneeb", 4)];
n && a && App.addCardIcon(e, n + "-" + a, G._("The Bid"), [ {
klass: "fa fa-legal",
style: "padding: 0 15px;"
} ]);
}, this);
}), App.Tarneeb400Game.TarneebSyrianStack = App.StackView.extend({
canPlay: function(e, t) {
if (t.get("name") !== "stack_p_" + App.game.getActingIndex()) return !1;
if (!App.game.playerHasTurn(App.game.getActingIndex())) return !1;
if (!App.game.inState("in_hand")) return !1;
var a, n = App.game.stacks.stack_table;
return !!n.isUpToDate() && !(!n.empty() && (a = n.get("cards").first().suit()) !== e.suit() && _.any(App.game.stacks["stack_p_" + App.game.getActingIndex()].get("cards").map(function(e) {
return e.suit() === a;
}), _.identity));
},
onClick: function(e, t) {
var a = [ "move", t.get("name"), "stack_table", e.id ];
App.commander.performCmdExternal(a), App.comm.moveCard(a[3], a[1], a[2]);
}
}), App.Tarneeb400Game.stackView = function() {
return App.Tarneeb400Game.TarneebSyrianStack;
}, App.Tarneeb400Game.gameSummaryInfo = function() {
var e = [], t = App.game.read("hs.tarneeb");
if (_.isNumber(t)) {
var a = [ "Hearts", "Spades", "Diamonds", "Clubs" ];
e.push({
label: G._("Trump"),
value: G._(a[t])
});
}
return e;
}, App.Tarneeb400Game.iAmPartnerChooser = function() {
return !App.current_user.isWatcher() && this.read("partner_chooser") === this.getActingIndex();
}, App.Tarneeb400Game.iAmPartnerAccepter = function() {
return !App.current_user.isWatcher() && _.include(this.read("partner_with"), this.getActingIndex());
}, App.Tarneeb400Game.playerIsBidder = function(e) {
return this.read("hs.bidder") === e;
}, App.Tarneeb400Game.iAmNextBidder = function() {
return this.read("hs.next_bidder") === this.getActingIndex() && !App.current_user.isWatcher();
}, App.Tarneeb400Game.iAmBidder = function() {
return this.read("hs.bidder") === this.getActingIndex() && !App.current_user.isWatcher();
}, App.Tarneeb400Game.bidText = function(e) {
return e;
}, App.Tarneeb400Game.passText = function() {
return G._("tarneeb.pass");
}, App.Tarneeb400Game.trumpText = function() {
return G._("Trump");
}, App.Tarneeb400Game.suitText = function(e) {
var t = [ "Hearts", "Spades", "Diamonds", "Clubs" ];
return G._(t[e]);
}, App.Tarneeb400Game.chooseTrumpText = function() {
return G._("Choose your tarneeb");
}, App.Tarneeb400Game.playerCircleMonitoredEVs = function() {
return "change:gs:hs:num_eaten";
}, App.Tarneeb400Game.getPlayerCircle = function(e) {
var a = e.playerIndex(), t = "", n = this.read("hs.num_eaten." + a, 0), i = _.inject([ 1, 2, 3 ], function(e, t) {
return e + App.game.read("hs.num_eaten." + (a + t) % 4, 0);
}, 0), r = this.read("hs.bids." + a);
this.inState("in_hand") && (r <= n ? t = "positive" : 13 - i < r && (t = "negative"));
var s = G._("Eaten cards"), o = $("<div class='score' rel='tooltip' title='" + s + "'>" + n + "</div>");
return o.addClass(t), o;
}, App.Tarneeb400Game.scoresTabExtension = {
gameWinner: function(e) {
var t = App.game.scores(), a = function(e) {
return Math.min(t[e % 4], 41);
};
return a(e) + a(e + 2) > a(e + 1) + a(e + 3);
},
roundHeader: function(e) {
return e ? App.game.players[e[1]].name() : G._("Dealer");
},
roundWinner: function(e, t, a) {
return 0 < e[0][a];
}
}, App.Tarneeb400Game.classBind("started", function() {
for (var e = 2; e < 14; e++) App.sound.load("tarneeb_" + e, "/media/tarneeb_" + e + "_" + G.lang().toLowerCase() + ".mp3");
_.each(App.Card.RealSuits, function(e, t) {
App.sound.load("suit_" + t, "/media/general_" + e.toLowerCase() + "_" + G.lang().toLowerCase() + ".mp3");
});
}), App.Tarneeb400Game.classBind("change", function() {
this.isChanged("state") && "hand_more" === this.read("state") && App.sound.play("suit_" + this.read("hs.tarneeb"));
}), App.Tarneeb400Game.classBind("change:gs:hs:bids", function() {
"hand_more" === this.readOld("state") && this.isChanged("hs.bids") && App.sound.play("tarneeb_" + this.read("hs.bids." + this.readOld("hs.next_bidder")));
}), App = window.App || {}, App.SyrianBid = App.Lightbox.extend({
inGame: !0,
form: !0,
klass: "form-horizontal",
title: G._("The Bid"),
template: JST["jsts/games/tarneeb400/bid"],
footer: [ {
type: "button",
name: "Bid",
action: "go"
} ],
visible: function() {
return this.model.gameIs("Tarneeb400") && this.model.inState("hand_more") && this.model.iAmNextBidder();
},
go: function() {
App.comm.sendGame("bid", {
bid: this.$("#bidValue").val()
}), this.deactivate();
}
}, {
monitoredEvents: [ "change:gs:state", "change:gs:hs:next_bidder" ]
}), App.syrianBid = new App.SyrianBid({
model: App.game
}), App.TarneebEgyptianGame = App.CardGame.newGameHash(App.TarneebGame), App.TarneebEgyptianGame.classBind("change:gs", function() {
if ("hand_more" === this.readOld("state")) {
var e = this.readOld("hs.next_bidder");
if (this.isChanged("hs.bid")) {
var t = this.read("hs.bid_suit");
this.vaporize(e, _.string.sprintf("%d (%s)", this.read("hs.bid"), G._(-1 === t ? "No Trump" : App.Card.Suits[t])));
} else this.isChanged("hs.doubled") ? this.vaporize(e, "x2") : this.isChanged("hs.num_passes") && this.vaporize(e, G._("tarneeb.pass"));
}
}, "tarneeb-vapor"), App.TarneebEgyptianGame.classBind("started", function() {
for (var e = 4; e < 14; e++) App.sound.load("tarneeb_" + e, "/media/tarneeb_" + e + "_" + G.lang().toLowerCase() + ".mp3");
App.sound.load("general_pass", "/media/general_pass.mp3"), App.sound.load("double", "/media/baloot_double_2.mp3");
}), App.TarneebEgyptianGame.classBind("change", function() {
"hand_more" === this.readOld("state") && (this.isChanged("hs.bid") ? App.sound.play("tarneeb_" + this.read("hs.bid").toString()) : this.isChanged("hs.doubled") ? App.sound.play("double") : this.isChanged("hs.num_passes") && App.sound.play("general_pass"));
}, "tarneeb-sound"), App.EgyptianBid = App.Lightbox.extend({
inGame: !0,
form: !0,
klass: "form-horizontal",
title: G._("estimation.bid"),
template: JST["jsts/games/tarneeb_egyptian/bid"],
footer: [ {
type: "a",
name: "Pass",
action: "pass"
}, {
type: "button",
name: "Bid",
action: "go"
}, {
type: "button",
name: "Double",
action: "double",
visible: function() {
return App.game.gameIs("TarneebEgyptian") && 0 < App.game.read("hs.bid") && (App.game.read("hs.bidder") + App.game.getActingIndex()) % 2 == 1 && !App.game.read("hs.doubled");
}
} ],
visible: function() {
return (this.model.gameIs("Estimation") || this.model.gameIs("TarneebEgyptian")) && this.model.inState("hand_more") && this.model.iAmNextBidder();
},
go: function() {
App.comm.sendGame("bid", {
bid: this.$("#egyptianBidValue").val(),
suit: this.selectedRadioValue("tarneebSuit")
}), this.deactivate();
},
pass: function() {
App.comm.sendGame("pass"), this.deactivate();
},
"double": function() {
App.comm.sendGame("pass", {
"double": "true"
}), this.deactivate();
}
}, {
monitoredEvents: [ "change:gs:state", "change:gs:hs:next_bidder" ]
}), App.egyptianBid = new App.EgyptianBid({
model: App.game
}), App.TarneebSyrian41Game = App.CardGame.newGameHash(), App.TarneebSyrian41Game.classBind("change:gs", function() {
"hand_more" === this.readOld("state") && _.each(this.read("hs.bids"), function(e, t) {
this.isChanged("hs.bids." + t) && this.vaporize(t, e.toString());
}, this);
}), App.TarneebSyrian41Game.classBind("change:gs started", function() {
_.each(this.seats, function(e) {
App.clearCardIcons(e);
var t = e.get("player").get("index"), a = this.read("hs.bids", [])[t], n = [ "heart", "spade", "diamond", "club" ][this.read("hs.tarneeb", 4)];
n && a && App.addCardIcon(e, n + "-" + a, G._("The Bid"), [ {
klass: "fa fa-legal",
style: "padding: 0 15px;"
} ]);
}, this);
}), App.TarneebSyrian41Game.TarneebSyrianStack = App.StackView.extend({
canPlay: function(e, t) {
if (t.get("name") !== "stack_p_" + App.game.getActingIndex()) return !1;
if (!App.game.playerHasTurn(App.game.getActingIndex())) return !1;
if (!App.game.inState("in_hand")) return !1;
var a, n = App.game.stacks.stack_table;
return !!n.isUpToDate() && !(!n.empty() && (a = n.get("cards").first().suit()) !== e.suit() && _.any(App.game.stacks["stack_p_" + App.game.getActingIndex()].get("cards").map(function(e) {
return e.suit() === a;
}), _.identity));
},
onClick: function(e, t) {
var a = [ "move", t.get("name"), "stack_table", e.id ];
App.commander.performCmdExternal(a), App.comm.moveCard(a[3], a[1], a[2]);
}
}), App.TarneebSyrian41Game.stackView = function() {
return App.TarneebSyrian41Game.TarneebSyrianStack;
}, App.TarneebSyrian41Game.gameSummaryInfo = function() {
var e = [], t = App.game.read("hs.tarneeb");
if (_.isNumber(t)) {
var a = [ "Hearts", "Spades", "Diamonds", "Clubs" ];
e.push({
label: G._("Trump"),
value: G._(a[t])
});
var n = _.inject(App.game.read("hs.bids", []), function(e, t) {
return e + t;
}, 0);
n && e.push({
label: G._("Bids"),
value: n
});
}
return e;
}, App.TarneebSyrian41Game.iAmPartnerChooser = function() {
return !App.current_user.isWatcher() && this.read("partner_chooser") === this.getActingIndex();
}, App.TarneebSyrian41Game.iAmPartnerAccepter = function() {
return !App.current_user.isWatcher() && _.include(this.read("partner_with"), this.getActingIndex());
}, App.TarneebSyrian41Game.playerIsBidder = function(e) {
return this.read("hs.bidder") === e;
}, App.TarneebSyrian41Game.iAmNextBidder = function() {
return this.read("hs.next_bidder") === this.getActingIndex() && !App.current_user.isWatcher();
}, App.TarneebSyrian41Game.iAmBidder = function() {
return this.read("hs.bidder") === this.getActingIndex() && !App.current_user.isWatcher();
}, App.TarneebSyrian41Game.bidText = function(e) {
return e;
}, App.TarneebSyrian41Game.passText = function() {
return G._("tarneeb.pass");
}, App.TarneebSyrian41Game.trumpText = function() {
return G._("Trump");
}, App.TarneebSyrian41Game.suitText = function(e) {
var t = [ "Hearts", "Spades", "Diamonds", "Clubs" ];
return G._(t[e]);
}, App.TarneebSyrian41Game.chooseTrumpText = function() {
return G._("Choose your tarneeb");
}, App.TarneebSyrian41Game.playerCircleMonitoredEVs = function() {
return "change:gs:hs:num_eaten";
}, App.TarneebSyrian41Game.getPlayerCircle = function(e) {
var a = e.playerIndex(), t = "", n = this.read("hs.num_eaten." + a, 0), i = _.inject([ 1, 2, 3 ], function(e, t) {
return e + App.game.read("hs.num_eaten." + (a + t) % 4, 0);
}, 0), r = this.read("hs.bids." + a);
this.inState("in_hand") && (r <= n ? t = "positive" : 13 - i < r && (t = "negative"));
var s = G._("Eaten cards"), o = $("<div class='score' rel='tooltip' title='" + s + "'>" + n + "</div>");
return o.addClass(t), o;
}, App.TarneebSyrian41Game.scoresTabExtension = {
gameWinner: function(e) {
var t = App.game.scores(), a = function(e) {
return Math.min(t[e % 4], 41);
};
return a(e) + a(e + 2) > a(e + 1) + a(e + 3);
},
roundHeader: function(e) {
return e ? App.game.players[e[1]].name() : G._("Dealer");
},
roundWinner: function(e, t, a) {
return 0 < e[0][a];
}
}, App.TarneebSyrian41Game.classBind("started", function() {
for (var e = 2; e < 14; e++) App.sound.load("tarneeb_" + e, "/media/tarneeb_" + e + "_" + G.lang().toLowerCase() + ".mp3");
_.each(App.Card.RealSuits, function(e, t) {
App.sound.load("suit_" + t, "/media/general_" + e.toLowerCase() + "_" + G.lang().toLowerCase() + ".mp3");
});
}), App.TarneebSyrian41Game.classBind("change", function() {
this.isChanged("state") && "hand_more" === this.read("state") && App.sound.play("suit_" + this.read("hs.tarneeb"));
}), App.TarneebSyrian41Game.classBind("change:gs:hs:bids", function() {
"hand_more" === this.readOld("state") && this.isChanged("hs.bids") && App.sound.play("tarneeb_" + this.read("hs.bids." + this.readOld("hs.next_bidder")));
}), App = window.App || {}, App.SyrianBid = App.Lightbox.extend({
inGame: !0,
form: !0,
klass: "form-horizontal",
title: G._("The Bid"),
template: JST["jsts/games/tarneeb_syrian41/bid"],
footer: [ {
type: "button",
name: "Bid",
action: "go"
} ],
visible: function() {
return this.model.gameIs("TarneebSyrian41") && this.model.inState("hand_more") && this.model.iAmNextBidder();
},
go: function() {
App.comm.sendGame("bid", {
bid: this.$("#bidValue").val()
}), this.deactivate();
}
}, {
monitoredEvents: [ "change:gs:state", "change:gs:hs:next_bidder" ]
}), App.syrianBid = new App.SyrianBid({
model: App.game
}), App.EstimationGame = App.CardGame.newGameHash(App.TarneebGame), App.EstimationGame.classBind("change:gs started", function() {
_.each(this.seats, function(e) {
App.clearCardIcons(e);
var t = e.get("player").get("index");
if (this.read("round") < 14 && this.playerIsBidder(t)) {
var a = this.read("hs.bid");
if (a) {
var n = [ "nosuit", "heart", "spade", "diamond", "club" ][this.read("hs.bid_suit", -1) + 1];
App.addCardIcon(e, n + "-" + a, G._("The Bid"), [ {
klass: "fa fa-legal",
style: "padding: 0 15px;"
} ]);
}
} else {
var i = this.read("hs.states." + t, ""), r = this.read("hs.estimations." + t), s = [], o = {
w: "With",
wr: "With Risk",
wrr: "With Double Risk",
r: "Risk",
rr: "Double Risk",
dc: "Dash Call"
}[this.read("hs.states." + t)] || "";
o && s.push({
klass: "jicon-" + o.toLowerCase().replace(/ /g, "-"),
style: "padding: 0 15px;"
});
var p = "";
this.read("hs.avoiding." + t) && (p = G._("Avoid"), s.push({
klass: "jicon-avoid",
style: "padding: 0 " + (o ? "20px; margin-top: -7px;" : "15px;")
})), "dc" === i ? App.addCardIcon(e, "empty-card", G._("Dash Call") + (p ? " - " + p : ""), s) : _.isNumber(r) && 0 < r ? App.addCardIcon(e, "nosuit-" + r, G._(o || "Estimation") + (p ? " - " + p : ""), s) : p && App.addCardIcon(e, "empty-card", p, s);
}
}, this);
}, "card-icons"), App.EstimationGame.playerCircleMonitoredEVs = function() {
return "change:gs:hs:num_eaten";
}, App.EstimationGame.getPlayerCircle = function(e) {
var a = e.playerIndex(), t = "", n = this.read("hs.num_eaten." + a, 0), i = this.read("hs.estimations." + a), r = _.inject([ 1, 2, 3 ], function(e, t) {
return e + App.game.read("hs.num_eaten." + (a + t) % 4, 0);
}, 0);
i === n ? t = "positive" : (13 - r < i || i < n) && (t = "negative");
var s = G._("Eaten cards"), o = $("<div class='score' rel='tooltip' title='" + s + "'>" + n + "</div>");
return o.addClass(t), o;
}, App.EstimationGame.scoresTabExtension = {
roundHeader: function(e) {
var t, a;
return e ? (t = App.game.players[e[1]].name(), a = _.max(e[2])) : (t = G._("Bidder"), 
a = G._("The Bid")), _.string.sprintf("%s (%s)", t, a);
},
roundSummary: function(e, n) {
if (_.any(e[0])) return null;
var t = _.inject(App.game.read("track_scores"), function(e, t, a) {
return a <= n ? _.any(t[0]) ? 1 : e + 1 : e;
}, 1);
return G._("Next round is") + " x" + t;
},
roundScore: function(e, t, a) {
var n = "";
"" !== e[4][a] && (n = "b" === e[4][a] ? "<i class='jicon-large jicon-" + {
"-1": "nt",
0: "hearts",
1: "spades",
2: "diamonds",
3: "clubs"
}[e[3]] + "' style='color: " + {
"-1": "inherit",
0: "red",
1: "black",
2: "red",
3: "black"
}[e[3]] + ";'></i>" : "<i class='jicon-large jicon-" + {
wr: "with-risk",
wrr: "with-double-risk",
w: "with",
r: "risk",
dc: "dash-call",
rr: "double-risk"
}[e[4][a]] + "'></i>");
return _.string.sprintf("%d <br/> (%d / %d) <br/> %s", e[0][a], e[5][a], e[2][a], n);
},
roundWinner: function(e, t, a) {
return e[5][a] === e[2][a];
}
}, App.EstimationGame.classBind("started", function() {
App.sound.load("estimation_dash", "/media/estimation_dash.mp3"), App.sound.load("estimation_avoid", "/media/estimation_avoid.mp3");
for (var e = 0; e < 4; e++) App.sound.load("tarneeb_" + e, "/media/tarneeb_" + e + "_" + G.lang().toLowerCase() + ".mp3");
App.sound.load("general_pass", "/media/general_pass.mp3"), App.sound.load("double", "/media/baloot_double_2.mp3");
}), App.EstimationGame.classBind("change:gs", function() {
var e = this.readOld("state");
"blind_dashing" === e && this.isChanged("hs.blind_dash") && App.sound.play("estimation_dash"), 
"avoiding" === e && this.isChanged("hs.avoiding") && App.sound.play("estimation_avoid"), 
"estimation" === e && App.sound.play("tarneeb_" + this.read("hs.estimations")[this.readOld("hs.next_bidder")]);
}), App.EstimationGame.classBind("change", function() {
"hand_more" === this.readOld("state") && (this.isChanged("hs.bid") ? App.sound.play("tarneeb_" + this.read("hs.bid").toString()) : this.isChanged("hs.doubled") ? App.sound.play("double") : this.isChanged("hs.num_passes") && App.sound.play("general_pass"));
}, "tarneeb-sound"), App.Avoid = App.Lightbox.extend({
inGame: !0,
form: !0,
klass: "form-horizontal",
title: G._("Would you like to avoid or redeal?"),
footer: [ {
type: "a",
name: "Avoid",
action: "avoid"
}, {
type: "button",
name: "Redeal",
action: "redeal"
} ],
visible: function() {
return this.model.gameIs("Estimation") && this.model.inState("avoiding") && this.model.read("hs.ask_for_avoid." + this.model.getActingIndex()) && !this.model.read("hs.avoiding." + this.model.getActingIndex());
},
redeal: function() {
App.comm.sendGame("redeal");
},
avoid: function() {
App.comm.sendGame("avoid");
}
}, {
monitoredEvents: [ "change:gs:state", "change:gs:hs:ask_for_avoid", "change:gs:hs:avoiding" ]
}), App.BlindDash = App.Lightbox.extend({
inGame: !0,
form: !0,
klass: "form-horizontal",
title: G._("Would you like to dash call or bid?"),
footer: [ {
type: "a",
name: "Dash Call",
action: "blindDash"
}, {
type: "button",
name: "Bid",
action: "bid"
} ],
visible: function() {
return this.model.gameIs("Estimation") && App.game.inState("blind_dashing") && App.game.iAmNextBidder();
},
blindDash: function() {
App.comm.sendGame("blind_dash", {
blind_dash: "true"
});
},
bid: function() {
App.comm.sendGame("blind_dash");
}
}, {
monitoredEvents: [ "change:gs:state", "change:gs:hs:next_bidder" ]
}), App.Estimate = App.Lightbox.extend({
inGame: !0,
form: !0,
klass: "form-horizontal",
title: G._("Estimate"),
template: JST["jsts/games/estimation/estimate"],
footer: [ {
type: "button",
name: "OK",
action: "estimate"
} ],
visible: function() {
return this.model.gameIs("Estimation") && this.model.inState("estimation") && App.game.iAmNextBidder();
},
estimate: function() {
App.comm.sendGame("estimate", {
estimate: $("#estimateValue").val()
}), this.deactivate();
}
}, {
monitoredEvents: [ "change:gs:state", "change:gs:hs:next_bidder" ]
}), App.avoid = new App.Avoid({
model: App.game
}), App.blindDash = new App.BlindDash({
model: App.game
}), App.estimate = new App.Estimate({
model: App.game
}), App.EstimationGame.classBind("change:gs:hs:next_bidder", function() {
if ("blind_dashing" === this.readOld("state")) {
var e = this.readOld("hs.next_bidder");
_.isNumber(e) && this.vaporize(e, G._(this.read("hs.blind_dash." + e) ? "Dash Call" : "estimation.bid"));
}
}, "tarneeb-vapor"), App.EstimationGame.classBind("change:gs:hs:estimations", function() {
"estimation" === this.readOld("state") && _.each(this.read("hs.estimations"), function(e, t) {
if (this.isChanged("hs.estimations." + t)) {
var a = this.read("hs.states." + t), n = {
w: "With",
wr: "With Risk",
wrr: "With Double Risk",
r: "Risk",
rr: "Double Risk"
};
a = a ? " (" + G._(n[a]) + ")" : "", this.vaporize(t, (e || G._("Dash")) + a);
}
}, this);
}), App.EstimationGame.classBind("change:gs:hs:avoiding", function() {
var a = this.readOld("hs.avoiding");
_.each(this.read("hs.avoiding"), function(e, t) {
e && e !== a[t] && this.vaporize(t, G._("Avoid"));
}, this);
}), App.TrixGame = App.CardGame.newGameHash(), App.TrixGame.classBind("started change:gs:hs:player_turn", function() {
setTimeout(function() {
App.gameActions.itemVisible("pass") && (App.gameActions.hideItem("pass"), App.comm.sendGame("pass"));
}, 500);
}), App.TrixGame.TrixStack = App.StackView.extend({
canBeDoubled: function(e) {
var t = e.val();
if (e.stack().get("name").match(/^stack_p_/)) switch (App.game.handName()) {
case "king":
return 11 === t;

case "queens":
return t % 13 == 10;
}
return !1;
},
findDestinationStack: {
ltoosh: function() {
return "stack_table";
},
king: function() {
return "stack_table";
},
queens: function() {
return "stack_table";
},
diamonds: function() {
return "stack_table";
},
trix: function(e) {
var t, a, n = Math.floor(e / 13);
if (e % 13 == 9) {
for (a = 0; a < 4; a++) if (!App.game.stacks["stack_t_" + a].get("cards").length) return "stack_t_" + a.toString();
} else {
var i = function(e, t) {
return e - t;
};
for (a = 0; a < 4; a++) if ((t = App.game.stacks["stack_t_" + a].get("cards").invoke("val").sort(i)).length && n === Math.floor(t[0] / 13) && (e === t[0] - 1 || e === t[t.length - 1] + 1)) return "stack_t_" + a.toString();
}
return !1;
}
},
canPlay: function(e, t) {
if (t.owner() !== App.game.getActingIndex()) return !1;
switch (App.game.read("state").toString()) {
case "in_hand":
if (!App.game.playerHasTurn(App.game.getActingIndex())) return !1;
if (App.game.inHand("trix")) {
for (var a = 0; a < 4; a++) if (!App.game.stacks["stack_t_" + a].isUpToDate()) return !1;
if (!this.findDestinationStack.trix(e.val())) return !1;
} else {
var n, i = App.game.stacks.stack_table;
if (!i.isUpToDate()) return !1;
if (!i.empty() && (n = Math.floor(i.get("cards").first().val() / 13)) !== Math.floor(e.val() / 13) && _.any(_.map(App.game.stacks["stack_p_" + App.game.getActingIndex()].allCards(), function(e) {
return Math.floor(e.val() / 13) === n;
}), _.identity)) return !1;
}
break;

case "hand_more":
if (!this.canBeDoubled(e)) return !1;
break;

default:
return !1;
}
return !0;
},
onClick: function(e, t) {
switch (App.game.read("state").toString()) {
case "in_hand":
var a = [ "move", t.get("name"), this.findDestinationStack[App.game.handName()](e.id), e.id ];
App.commander.performCmdExternal(a), App.comm.moveCard(a[3], a[1], a[2]);
break;

case "hand_more":
App.UIManager.tempDoublingCard = e, App.confirmDoubling.activate();
break;

default:
return !1;
}
}
}), App.TrixGame.stackView = function() {
return App.TrixGame.TrixStack;
}, App.TrixGame.gameSummaryInfo = function() {
var e = [];
if (App.game.dealer()) {
var t = _.isString(App.game.handName()) && !App.game.inHand([ "prep", "" ]), a = App.game.gameName().match(/Complex/) ? 2 : 5, n = Math.floor(App.game.read("track_scores").length / a) + 1;
e.push({
label: G._("Kingdom"),
value: n + " - " + App.game.dealer().name()
}), t && e.push({
label: G._("Game"),
value: G._("trix." + App.game.handName())
});
}
var i = App.game.read("hs.tarneeb");
return _.isNumber(i) && "tarneeb" == App.game.handName() && e.push({
label: App.game.trumpText(),
value: -1 === i ? G._("No Trump") : App.game.suitText(i)
}), e;
}, App.TrixGame.handsPerKingdom = function() {
return this.gameIs([ "Trix", "TrixPartner" ]) ? 5 : 2;
}, App.TrixGame.iCanPass = function() {
var a = [ 9, 22, 35, 48 ];
_.each(this.stacks, function(e) {
if ("t" === e.kind() && !e.empty()) {
var t = _.sortBy(App.game.read("hs.stacks." + e.get("name") + ".contains_new").map(function(e) {
return e.val;
}), _.identity);
t[0] % 13 != 0 && a.push(t[0] - 1), _.last(t) % 13 != 12 && a.push(_.last(t) + 1);
}
});
var e = App.game.read("hs.stacks.stack_p_" + this.getActingIndex() + ".contains_new").map(function(e) {
return e.val;
}), t = App.game.read("hs.stacks.stack_pv_" + this.getActingIndex() + ".contains_new");
return null != t && (t = t.map(function(e) {
return e.val;
})), e = e.concat(t), 0 === _.intersect(a, e).length;
}, App.TrixGame.playerCircleMonitoredEVs = function() {
return "change:gs:hs:scores";
}, App.TrixGame.getPlayerCircle = function(e) {
var t = e.playerIndex(), a = G._("Round Score");
return $("<div class='score' rel='tooltip' title='" + a + "'>" + this.read("hs.scores." + t, 0) + "</div>");
}, App.TrixGame.scoresTabExtension = {
roundHeader: function(e, t) {
if (e) {
var a = (4 + App.game.read("dealer") - Math.floor(App.game.read("track_scores").length / App.game.handsPerKingdom()) + Math.floor(t / App.game.handsPerKingdom())) % 4, n = G._(e[1].match(/::([^:]*?)$/)[1]), i = App.game.players[a].name();
return _.string.sprintf("%s (%s)", n, i);
}
return G._("Hand");
},
roundWinner: function(e, t, a) {
return e[0][a] === _.max(e[0]);
}
}, App.TrixGame.classBind("started", function() {
_.each([ "pass", "king", "queen" ], function(e) {
App.sound.load("trix_" + e, "/media/trix_" + e + ".mp3");
}), _.each([ "ltoosh", "queens", "diamonds", "king", "trix", "complex" ], function(e) {
App.sound.load("hand_" + e, "/media/trix_" + e + "_" + G.lang().toLowerCase() + ".mp3");
});
}), App.TrixGame.classBind("change:gs:state", function() {
"before_hands" === this.readOld("state") && App.sound.play("hand_" + this.handName().toLowerCase());
}), App.TrixGame.cardMoveSound = function(e) {
11 === e.card && this.inHand([ "king", "complex" ]) ? App.sound.play("trix_king") : e.card % 13 == 10 && this.inHand([ "queens", "complex" ]) ? App.sound.play("trix_queen") : this.inState("in_hand") && App.sound.play("card_played");
}, App.TrixGame.classBind("trixPass", function() {
App.sound.play("trix_pass");
}), App.SelectHand = App.Lightbox.extend({
inGame: !0,
form: !0,
klass: "form-horizontal",
title: G._("Game"),
template: JST["jsts/games/trix/select_hand"],
footer: [ {
type: "button",
name: "Go",
action: "go"
} ],
visible: function() {
return this.model.gameName().match(/Trix|Kasra/) && this.model.inState("before_hands") && this.model.iAmDealer();
},
go: function() {
App.comm.sendGame("hand", {
hand: this.$("#nextHandName").val()
}), this.deactivate();
}
}, {
monitoredEvents: [ "change:gs:state", "change:gs:dealer" ]
}), App.ConfirmDoubling = App.Lightbox.extend({
inGame: !0,
form: !0,
klass: "form-horizontal",
title: G._("Are you sure you want to double this card?"),
template: JST["jsts/games/trix/confirm_doubling"],
footer: [ {
type: "a",
name: "No",
action: "no"
}, {
type: "button",
name: "Yes",
action: "yes"
} ],
yes: function() {
App.comm.sendGame("double", {
card: App.UIManager.tempDoublingCard.val().toString()
}), this.deactivate();
},
no: function() {
this.deactivate();
}
}), App.selectHand = new App.SelectHand({
model: App.game
}), App.confirmDoubling = new App.ConfirmDoubling({
model: App.game
}), App.TrixGame.classBind("started", function() {
App.gameActions.addItems([ {
id: "pass",
name: "Pass",
visible: function() {
return App.game.inHand("trix") && App.game.iHaveTurn() && App.game.iCanPass();
},
onClick: function() {
this.hideItem("pass"), App.comm.sendGame("pass");
},
monitoredEvents: [ "change:gs:state", "change:gs:current_hand", "change:gs:hs:player_turn" ]
}, {
id: "ready",
name: "Ready",
visible: function() {
return App.game.inState("hand_more") && !App.game.read("hs.more_ready." + App.game.getActingIndex());
},
onClick: function() {
App.comm.sendGame("player_ready"), this.hideItem("ready");
},
monitoredEvents: [ "change:gs:state", "change:gs:hs:more_ready" ]
} ]);
}), App.TrixGame.gameMessage = function() {
if (this.inState("hand_more") && !this.read("hs.more_ready." + this.getActingIndex())) return 'Click a card to double it then click "Ready" when done.';
}, App.TrixGame.classBind("change:gs:state", function() {
if ("before_hands" === this.readOld("state")) {
var e = this.read("dealer");
this.vaporize(e, G._(_.string.capitalize(this.handName())));
}
}), App.TrixGame.classBind("trixPass", function() {
var e = this.readOld("hs.player_turn");
this.vaporize(e, G._("tarneeb.pass"));
}), App.TrixComplexGame = App.CardGame.newGameHash(App.TrixGame), App.TrixComplexGame.TrixComplexStack = App.StackView.extend({
canBeDoubled: function(e) {
var t = e.val();
if (e.stack().get("name").match(/^stack_p_/)) switch (App.game.handName()) {
case "complex":
return t % 13 == 10 || 11 === t;
}
return !1;
},
findDestinationStack: {
complex: function() {
return "stack_table";
},
trix: function(e) {
var t, a, n = e, i = Math.floor(n / 13);
if (n % 13 == 9) {
for (a = 0; a < 4; a++) if (!App.game.stacks["stack_t_" + a].get("cards").length) return "stack_t_" + a.toString();
} else {
var r = function(e, t) {
return e - t;
};
for (a = 0; a < 4; a++) if ((t = App.game.stacks["stack_t_" + a].get("cards").invoke("val").sort(r)).length && i === Math.floor(t[0] / 13) && (n === t[0] - 1 || n === t[t.length - 1] + 1)) return "stack_t_" + a.toString();
}
return !1;
}
},
canPlay: function(e, t) {
if (t.owner() !== App.game.getActingIndex()) return !1;
switch (App.game.read("state").toString()) {
case "in_hand":
if (!App.game.playerHasTurn(App.game.getActingIndex())) return !1;
if (App.game.inHand("trix")) {
for (var a = 0; a < 4; a++) if (!App.game.stacks["stack_t_" + a].isUpToDate()) return !1;
if (!this.findDestinationStack.trix(e.val())) return !1;
} else {
var n, i = App.game.stacks.stack_table;
if (!i.isUpToDate()) return !1;
if (!i.empty() && (n = Math.floor(i.get("cards").first().val() / 13)) !== Math.floor(e.val() / 13) && _.any(_.map(App.game.stacks["stack_p_" + App.game.getActingIndex()].allCards(), function(e) {
return Math.floor(e.val() / 13) === n;
}), _.identity)) return !1;
}
break;

case "hand_more":
if (!this.canBeDoubled(e)) return !1;
break;

default:
return !1;
}
return !0;
},
onClick: function(e, t) {
switch (App.game.read("state").toString()) {
case "in_hand":
var a = [ "move", t.get("name"), this.findDestinationStack[App.game.handName()](e.id), e.id ];
App.commander.performCmdExternal(a), App.comm.moveCard(a[3], a[1], a[2]);
break;

case "hand_more":
App.UIManager.tempDoublingCard = e, App.confirmDoubling.activate();
break;

default:
return !1;
}
}
}), App.TrixComplexGame.stackView = function() {
return App.TrixComplexGame.TrixComplexStack;
}, App.ComplexComplexGame = App.CardGame.newGameHash(App.TrixComplexGame), App.TrixPartnerGame = App.CardGame.newGameHash(App.TrixGame), 
App.TrixPartnerGame.TrixParnerStack = App.StackView.extend({
canPlay: function(e, t) {
if (t.owner() !== App.game.getActingIndex()) return !1;
switch (App.game.read("state").toString()) {
case "in_hand":
if (!App.game.playerHasTurn(App.game.getActingIndex())) return !1;
if (App.game.inHand("trix")) {
for (var a = 0; a < 4; a++) if (!App.game.stacks["stack_t_" + a].isUpToDate()) return !1;
if (!this.findDestinationStack.trix(e.val())) return !1;
} else {
var n, i = App.game.stacks.stack_table;
if (!i.isUpToDate()) return !1;
if (!i.empty() && (n = Math.floor(i.get("cards").first().val() / 13)) !== Math.floor(e.val() / 13) && _.any(_.map(App.game.stacks["stack_p_" + App.game.getActingIndex()].allCards(), function(e) {
return e.suit() === n;
}), _.identity)) return !1;
}
break;

case "hand_more":
if (!this.canBeDoubled(e)) return !1;
break;

default:
return !1;
}
return !0;
},
canBeDoubled: function(e) {
var t = e.val();
if (e.stack().get("name").match(/^stack_p_/)) switch (App.game.handName()) {
case "king":
return 11 === t;

case "queens":
return t % 13 == 10;
}
return !1;
},
findDestinationStack: {
ltoosh: function() {
return "stack_table";
},
king: function() {
return "stack_table";
},
queens: function() {
return "stack_table";
},
diamonds: function() {
return "stack_table";
},
trix: function(e) {
var t, a, n = Math.floor(e / 13);
if (e % 13 == 9) {
for (a = 0; a < 4; a++) if (!App.game.stacks["stack_t_" + a].get("cards").length) return "stack_t_" + a.toString();
} else {
var i = function(e, t) {
return e - t;
};
for (a = 0; a < 4; a++) if ((t = App.game.stacks["stack_t_" + a].get("cards").invoke("val").sort(i)).length && n === Math.floor(t[0] / 13) && (e === t[0] - 1 || e === t[t.length - 1] + 1)) return "stack_t_" + a.toString();
}
return !1;
}
},
onClick: function(e, t) {
switch (App.game.read("state").toString()) {
case "in_hand":
var a = [ "move", t.get("name"), this.findDestinationStack[App.game.handName()](e.id), e.id ];
App.commander.performCmdExternal(a), App.comm.moveCard(a[3], a[1], a[2]);
break;

case "hand_more":
App.UIManager.tempDoublingCard = e, App.confirmDoubling.activate();
break;

default:
return !1;
}
}
}), App.TrixPartnerGame.stackView = function() {
return App.TrixPartnerGame.TrixParnerStack;
}, App.TrixPartnerGame.iAmPartnerChooser = App.TarneebGame.iAmPartnerChooser, App.TrixPartnerGame.iAmPartnerAccepter = App.TarneebGame.iAmPartnerAccepter, 
App.TrixPartnerGame.scoresTabExtension = {
roundHeader: function(e, t) {
if (e) {
var a = (4 + App.game.read("dealer") - Math.floor(App.game.read("track_scores").length / App.game.handsPerKingdom()) + Math.floor(t / App.game.handsPerKingdom())) % 4, n = G._(e[1].match(/::([^:]*?)$/)[1]), i = App.game.players[a].name();
return _.string.sprintf("%s (%s)", n, i);
}
return G._("Hand");
},
roundScore: function(e, t, a) {
return e[0][a] + e[0][a + 2];
},
roundWinner: function(e, t, a) {
return this.roundScore(e, t, a) > this.roundScore(e, t, 1 - a);
}
}, App.TrixComplexPartnerGame = App.CardGame.newGameHash(App.TrixGame), App.TrixComplexPartnerGame.TrixCompPartnerStack = App.StackView.extend({
canBeDoubled: function(e) {
var t = e.val();
return !!e.stack().get("name").match(/^stack_p_/) && ("complex" === App.game.handName() && (t % 13 == 10 || 11 === t));
},
findDestinationStack: {
complex: function() {
return "stack_table";
},
trix: function(e) {
var t, a;
if (9 === e.rank()) {
for (a = 0; a < 4; a++) if (!App.game.stacks["stack_t_" + a].get("cards").length) return "stack_t_" + a.toString();
} else {
var n = function(e, t) {
return e - t;
};
for (a = 0; a < 4; a++) if ((t = App.game.stacks["stack_t_" + a].get("cards").invoke("val").sort(n)).length && e.suit() === Math.floor(t[0] / 13) && (e.val() === t[0] - 1 || e.val() === t[t.length - 1] + 1)) return "stack_t_" + a.toString();
}
return !1;
}
},
canPlay: function(e, t) {
if (t.owner() !== App.game.getActingIndex()) return !1;
switch (App.game.read("state").toString()) {
case "in_hand":
if (!App.game.playerHasTurn(App.game.getActingIndex())) return !1;
if (App.game.inHand("trix")) {
for (var a = 0; a < 4; a++) if (!App.game.stacks["stack_t_" + a].isUpToDate()) return !1;
if (!this.findDestinationStack.trix(e)) return !1;
} else {
var n, i = App.game.stacks.stack_table;
if (!i.isUpToDate()) return !1;
if (!i.empty() && (n = i.get("cards").first().suit()) !== e.suit() && _.any(_.map(App.game.stacks["stack_p_" + App.game.getActingIndex()].allCards(), function(e) {
return e.suit() === n;
}), _.identity)) return !1;
}
break;

case "hand_more":
if (!this.canBeDoubled(e)) return !1;
break;

default:
return !1;
}
return !0;
},
onClick: function(e, t) {
switch (App.game.read("state").toString()) {
case "in_hand":
var a = [ "move", t.get("name"), this.findDestinationStack[App.game.handName()](e), e.id ];
App.commander.performCmdExternal(a), App.comm.moveCard(a[3], a[1], a[2]);
break;

case "hand_more":
App.UIManager.tempDoublingCard = e, App.confirmDoubling.activate();
break;

default:
return !1;
}
}
}), App.TrixComplexPartnerGame.stackView = function() {
return App.TrixComplexPartnerGame.TrixCompPartnerStack;
}, App.TrixComplexPartnerGame.iAmPartnerChooser = App.TarneebGame.iAmPartnerChooser, 
App.TrixComplexPartnerGame.iAmPartnerAccepter = App.TarneebGame.iAmPartnerAccepter, 
App.TrixComplexPartnerGame.scoresTabExtension = App.TrixPartnerGame.scoresTabExtension, 
App.ComplexComplexPartnerGame = App.CardGame.newGameHash(App.TrixComplexPartnerGame), 
App.SbeetiyaGame = App.CardGame.newGameHash(), App.SbeetiyaGame.SbeetiyaStack = App.StackView.extend({
canPlay: function(e, t) {
if (t.owner() !== App.game.getActingIndex()) return !1;
switch (App.game.read("state").toString()) {
case "in_hand":
if (!App.game.playerHasTurn(App.game.getActingIndex())) return !1;
var a, n = App.game.stacks.stack_table;
if (!n.isUpToDate()) return !1;
if (!n.empty() && (a = n.get("cards").first().suit()) !== e.suit() && _.any(App.game.stacks["stack_p_" + App.game.getActingIndex()].get("cards").map(function(e) {
return e.suit() === a;
}), _.identity)) return !1;
break;

case "exchanging":
if (App.game.read("hs.finished_exchange." + App.game.getActingIndex())) return !1;
break;

case "doubling":
if (23 !== e.val() && 34 !== e.val()) return !1;
break;

default:
return !1;
}
return !0;
},
onClick: function(e, t) {
switch (App.game.read("state").toString()) {
case "in_hand":
var a = [ "move", t.get("name"), "stack_table", e.id ];
App.commander.performCmdExternal(a), App.comm.moveCard(a[3], a[1], a[2]);
break;

case "exchanging":
$("#card-" + e.cid).toggleClass("chosencard");
break;

case "doubling":
App.UIManager.tempDoublingCard = e, App.sbeetiyaConfirmDoubling.activate();
}
}
});

var oldLoad = App.game.loadStacks;

App.SbeetiyaGame.loadStacks = function(e, t) {
_.each(_.range(4), _.bind(function(e) {
var t = "stack_pt_" + e;
this.stacks[t] || (this.stacks[t] = new App.CardStack({
name: t
}));
}, this)), oldLoad.apply(this, arguments);
}, App.SbeetiyaGame.stackView = function() {
return App.SbeetiyaGame.SbeetiyaStack;
}, App.SbeetiyaGame.gameSummaryInfo = function() {
var e = function() {
if (App.game.hasKey("team_scores")) {
var e = App.game.read("team_scores"), t = _.indexOf(e, _.min(e));
return e[0] === e[1] ? null : t === App.current_user.get("index") % 2 ? G._("Us") : G._("Them");
}
var a = _.min(App.game.read("overall_scores"));
return 1 === _.inject(App.game.read("overall_scores"), function(e, t) {
return t === a ? e + 1 : e;
}, 0) ? App.game.players[_.indexOf(App.game.read("overall_scores"), a)].name() : null;
}, t = [];
return App.game.dealer() && t.push({
label: G._("Dealer"),
value: App.game.dealer().name()
}), e() && t.push({
label: G._("Leader"),
value: e()
}), t;
}, App.SbeetiyaGame.iFinishedExchange = function() {
return this.read("hs.finished_exchange." + this.getActingIndex());
}, App.SbeetiyaGame.iFinishedDoubling = function() {
return this.read("hs.finished_doubling." + this.getActingIndex());
}, App.SbeetiyaGame.iFinishedAnnouncing = function() {
var e = this.read("hs.has_announced_no_eat." + this.getActingIndex());
return 0 == e || 1 == e;
}, App.SbeetiyaGame.getPlayerCircle = null, App.SbeetiyaGame.scoresTabExtension = {
gameWinner: function(e) {
var t = App.game.scores();
return t[e] === _.min(t);
},
roundHeader: function(e) {
return e ? App.game.players[e[1]].name() : G._("Dealer");
},
roundWinner: function(e, t, a) {
return e[0][a] === _.min(e[0]);
}
}, App.SbeetiyaGame.classBind("started", function() {
App.sound.load("sbeetiya_special_card", "/media/sbeetiya_special_card.mp3");
}), App.SbeetiyaGame.cardMoveSound = function(e) {
this.inState("in_hand") && (_.include([ 23, 34 ], e.card) ? App.sound.play("sbeetiya_special_card") : App.sound.play("card_played"));
}, App.SbeetiyaConfirmDoubling = App.Lightbox.extend({
inGame: !0,
form: !0,
klass: "form-horizontal",
title: G._("Are you sure you want to double this card?"),
template: JST["jsts/games/sbeetiya/confirm_doubling"],
footer: [ {
type: "a",
name: "No",
action: "cancel"
}, {
type: "button",
name: "Yes",
action: "yes"
} ],
yes: function() {
App.comm.sendGame("double", {
card: App.UIManager.tempDoublingCard.val().toString()
}), this.deactivate();
}
}), App.SbeetiyaConfirmExchange = App.Lightbox.extend({
inGame: !0,
form: !0,
klass: "form-horizontal",
title: G._("Are you sure you want to pass these cards?"),
template: JST["jsts/games/sbeetiya/confirm_exchange"],
footer: [ {
type: "a",
name: "No",
action: "cancel"
}, {
type: "button",
name: "Yes",
action: "yes"
} ],
yes: function() {
App.comm.sendGame("exchange", {
cards: _.map($(".chosencard"), function(e) {
return $(e).data("card").val();
}).join(",")
}), this.deactivate(), App.gameActions.hideItem("exchange"), $(".chosencard").removeClass("chosencard");
}
}), App.SbeetiyaAnnounceNoEat = App.Lightbox.extend({
inGame: !0,
form: !0,
klass: "form-horizontal",
title: G._("Announce that you won't eat?"),
footer: [ {
type: "button",
name: "Announce no eat (-20)",
action: "announce"
}, {
type: "a",
name: "Pass (-10)",
action: "pass"
} ],
visible: function() {
return this.model.gameIs("Sbeetiya") && this.model.inState("announcing") && !App.game.iFinishedAnnouncing();
},
announce: function() {
App.comm.sendGame("announce"), this.deactivate();
},
pass: function() {
App.comm.sendGame("pass"), this.deactivate();
}
}, {
monitoredEvents: [ "change:gs:state", "change:gs:hs:has_announced_no_eat" ]
}), App.sbeetiyaConfirmDoubling = new App.SbeetiyaConfirmDoubling({
model: App.game
}), App.sbeetiyaConfirmExchange = new App.SbeetiyaConfirmExchange({
model: App.game
}), App.sbeetiyaAnnounceNoEat = new App.SbeetiyaAnnounceNoEat({
model: App.game
}), App.SbeetiyaGame.classBind("change:gs:state", function() {
"exchanging" === this.readOld("state") && $(".chosencard").removeClass("chosencard");
}), App.SbeetiyaGame.classBind("started", function() {
App.gameActions.addItems([ {
id: "exchange",
name: "Pass Cards",
visible: function() {
return App.game.inState("exchanging") && !App.game.iFinishedExchange();
},
onClick: function() {
3 !== $(".chosencard").length ? App.Lightbox.error(G._("Select 3 cards to pass to the person on your left by clicking on each card.")) : App.sbeetiyaConfirmExchange.activate();
},
monitoredEvents: [ "change:gs:state", "change:gs:hs:finished_exchange" ]
}, {
id: "ready",
name: "Ready",
visible: function() {
return App.game.inState("doubling") && !App.game.iFinishedDoubling();
},
onClick: function() {
App.comm.sendGame("player_ready"), this.hideItem("ready");
},
monitoredEvents: [ "change:gs:state", "change:gs:hs:finished_doubling" ]
} ]);
}), App.SbeetiyaGame.gameMessage = function() {
return this.inState("exchanging") && !this.iFinishedExchange() ? 'Click on 3 cards to pass, then click on "Pass Cards" when done.' : this.inState("doubling") && !this.iFinishedDoubling() ? 'Click a card to double it then click "Ready" when done.' : void 0;
}, App.LeekhaGame = App.CardGame.newGameHash(App.SbeetiyaGame), App.LeekhaGame.iAmPartnerChooser = App.TarneebGame.iAmPartnerChooser, 
App.LeekhaGame.iAmPartnerAccepter = App.TarneebGame.iAmPartnerAccepter, App.LeekhaGame.scoresTabExtension = {
gameWinner: function(e) {
var t = App.game.scores();
return t[e] === _.min(t);
},
roundWinner: function(e, t, a) {
return e[0][a] === _.min(e[0]);
}
}, App.NathalaGame = App.CardGame.newGameHash(App.TarneebSyrian41Game), App.NathalaGame.classBind("change:gs", function() {
"hand_more" === App.game.readOld("state") && _.each(App.game.read("hs.bids"), function(e, t) {
!1 === App.game.readOld("hs.bids." + t) && App.game.isChanged("hs.bids." + t) && App.game.vaporize(t, 0 === e ? G._("tarneeb.pass") : e.toString());
});
}, "tarneeb-vapor"), App.NathalaGame.playerCircleMonitoredEVs = function() {
return "change:gs:hs:num_eaten";
}, App.NathalaGame.getPlayerCircle = function(e) {
var a = e.playerIndex(), t = "", n = this.read("hs.num_eaten." + a, 0), i = _.inject([ 0, 2 ], function(e, t) {
return e + App.game.read("hs.num_eaten." + (a + t) % 4, 0);
}, 0), r = _.inject([ 1, 3 ], function(e, t) {
return e + App.game.read("hs.num_eaten." + (a + t) % 4, 0);
}, 0), s = _.inject([ 0, 2 ], function(e, t) {
return e + App.game.read("hs.bids." + (a + t) % 4, 0);
}, 0);
this.inState("in_hand") && 3 <= s && (s <= i ? t = "positive" : 13 - r < s && (t = "negative"));
var o = G._("Eaten cards"), p = $("<div class='score' rel='tooltip' title='" + o + "'>" + n + "</div>");
return p.addClass(t), p;
}, App.NathalaBid = App.Lightbox.extend({
inGame: !0,
form: !0,
klass: "form-horizontal",
title: G._("The Bid"),
template: JST["jsts/games/nathala/bid"],
footer: [ {
type: "a",
name: "Pass",
action: "bidPass"
}, {
type: "button",
name: "Bid",
action: "bidGo"
} ],
visible: function() {
return this.model.gameIs("Nathala") && this.model.inState("hand_more") && this.model.iAmNextBidder();
},
bidGo: function() {
App.comm.sendGame("bid", {
bid: this.$("#bidValue").val()
}), this.deactivate();
},
bidPass: function() {
App.comm.sendGame("bid"), this.deactivate();
}
}, {
monitoredEvents: [ "change:gs:state", "change:gs:hs:next_bidder" ]
}), App.NathalaTarneebChoose = App.Lightbox.extend({
inGame: !0,
form: !0,
klass: "form-horizontal",
title: G._("Tarneeb"),
template: JST["jsts/games/nathala/tarneeb"],
footer: [ {
type: "button",
name: "Choose",
action: "tarneebGo"
} ],
visible: function() {
return this.model.gameIs("Nathala") && this.model.inState("re_trump") && App.game.getActingIndex() === App.game.read("hs.re_trump");
},
tarneebGo: function() {
this.selectedRadioValue("tarneebSuit") && (App.comm.sendGame("tarneeb", {
tarneeb: this.selectedRadioValue("tarneebSuit")
}), this.deactivate());
}
}, {
monitoredEvents: [ "change:gs:state" ]
}), App.nathalaBid = new App.NathalaBid({
model: App.game
}), App.nathalaTarneebChoose = new App.NathalaTarneebChoose({
model: App.game
}), App.OkeyGame = App.CardGame.newGameHash(), function() {
App.OkeyStackModel = App.CardStack.extend({
readCards: function() {
var e = "stack_p_" + App.game.getActingIndex();
if (this.get("name") !== e || App.game.observer) App.CardStack.prototype.readCards.apply(this, arguments); else {
var n = App.game.getSavedOrder(), i = _.clone(App.game.read("hs.stacks." + e + ".contains", [])), r = _.select(App.game.myOrderingStacks(), function(e) {
e.get("cards").reset();
e.get("name");
return !e.get("hidden");
});
_.each(App.game.myOrderingStacks(), function(e) {
var t = e.get("name");
if (n[t] && 0 < n[t].length && _.all(_.map(n[t], function(e) {
return _.include(i, e);
}), _.identity)) {
i = _.difference(i, n[t]);
var a = r.shift();
a ? a.get("cards").reset(_.map(n[t], function(e) {
return {
id: parseInt(e, 10)
};
})) : (i = i.concat(n[t]), n[t] = []);
}
});
var t = [];
n[e] && _.all(_.map(n[e], function(e) {
return _.include(i, e);
}), _.identity) && (i = _.difference(i, n[e]), t = n[e]), this.get("cards").reset(_.map(t.concat(i), function(e) {
return {
id: parseInt(e, 10)
};
})), App.game.arrangeOrderingStacks();
}
}
}), App.OkeyStack = App.StackView.extend({
onClick: function(e, t) {
var a = App.current_user.get("index");
if (App.game.iHaveTurn()) if (App.game.iStabbed()) {
if (t.get("name") === "stack_p_" + a) {
App.comm.sendGame("move", {
card: e.id,
from_name: t.get("name"),
to_name: "stack_table_fire_" + a
});
n = [ "move", t.get("name"), "stack_table_fire_" + a, e.id ];
App.commander.performCmdExternal(n);
}
} else if ("stack_deck" === t.get("name")) App.comm.sendGame("take_card", {
stack: t.get("name")
}); else if (t.get("name") === "stack_table_fire_" + (a + 3) % 4) {
App.comm.sendGame("move", {
card: e.id,
from_name: t.get("name"),
to_name: "stack_p_" + a
});
var n = [ "move", t.get("name"), "stack_p_" + a, e.id ];
App.commander.performCmdExternal(n);
}
},
onDrop: function(e, t, a, n, i) {
var r = this.offsetCardIndex(i, n);
if (this.model.get("name") === "stack_p_" + App.game.getActingIndex() || this.model.get("name").match(/^stack_ordering_(\d+)$/)) a.get("name").match("stack_table_fire") && App.comm.sendGame("move", {
card: e.id,
from_name: a.get("name"),
to_name: "stack_p_" + App.game.getActingIndex(),
card_index: r
}), a.removeCard(e), this.model.addCard(e, r); else if (this.model.get("name").match(/^stack_ontable_(\d+)$/) && App.game.iHaveTurn()) {
r = r >= this.model.get("cards").length ? this.model.get("cards").length - 1 : r;
var s = a.get("name").match("stack_table_fire") ? a.get("name") : "stack_p_" + App.game.getActingIndex();
App.comm.sendGame("add_to_ontable", {
card: e.id,
from_name: s,
to_name: this.model.get("name"),
card_index: r
}), App.commander.performCmdExternal([ "move", a.get("name"), this.model.get("name"), e.id, r ]);
} else this.model.get("name").match("stack_table_fire") && App.game.iHaveTurn() && App.game.iStabbed() && (App.comm.sendGame("move", {
card: e.id,
from_name: "stack_p_" + App.game.getActingIndex(),
to_name: this.model.get("name")
}), App.commander.performCmdExternal([ "move", a.get("name"), this.model.get("name"), e.id ]));
App.game.fillerCard.remove(), (this.model.get("name").match(/^stack_ordering_(\d+)$/) || a.get("name").match(/^stack_ordering_(\d+)$/)) && App.game.arrangeOrderingStacks(), 
App.game.saveOrder();
},
canPlay: function(e, t) {
var a = App.current_user.get("index");
return App.game.iStabbed() ? t.get("name") === "stack_p_" + a : _.include([ "stack_table_fire_" + (a + 3) % 4, "stack_deck" ], t.get("name"));
},
onMouseOver: $.noop,
onMouseOut: $.noop
}, {
cardClass: function(e) {
var t = App.game.jokerCard();
return e.isJoker() ? App.Card.Suits[t.suit].toLowerCase().slice(0, -1) + "-" + App.Card.Ranks[t.rank % 13] : e.val() === 13 * t.suit + t.rank ? "joker" : -1 < e.val() ? App.Card.Suits[e.suit()].toLowerCase().slice(0, -1) + "-" + App.Card.Ranks[e.rank() % 13] : "";
},
positionAttrs: function(e) {
return _.extend({}, App.StackView.positionAttrs(e), 0 === e ? {
dx: 22,
ordered: !1
} : {
ordered: !1
});
}
}), App.OkeyGame.stackView = function() {
return App.OkeyStack;
}, App.OkeyGame.GameSeatClass = App.GameSeat.extend({}, {
loadStacks: function(e) {
var t = e.get("player").get("index"), a = _.flatten(_.map(_.range(7 * t, 7 * t + 7), function(e) {
return [ "stack_ordering_" + e ];
}).concat([ "stack_p_" + t ]));
_.each(a, function(e) {
App.game.stacks[e] || (App.game.stacks[e] = new App.OkeyStackModel({
name: e
}), e.match(/^stack_ordering_(\d+)$/) && (App.current_user.isWatcher() || t !== App.current_user.get("index") ? App.game.stacks[e].set({
extendsStack: "stack_p_" + t
}) : App.game.stacks[e].set({
kind: "p",
owner: App.game.getActingIndex()
}))), App.game.stacks[e].readCards();
});
}
});
var t = function(e) {
var t = "stack_ontable_" + e, a = App.game.stacks[t];
App.game.stacks[t] || (a = App.game.stacks[t] = new App.OkeyStackModel({
name: t
})), a.readCards(), App.game.stackViews[a.get("name")] || (App.game.stackViews[a.get("name")] = new (App.game.stackView())({
id: a.get("name"),
className: "on-table",
model: a,
dx: 12,
ordered: !1,
parent: "#ontable-stack-container",
dynamicWidth: !0,
droppable: !0,
canDrop: function() {
return App.game.iHaveTurn();
}
}), App.game.cleanBind("change:gs:hs:player_turn", [ App.game.stackViews[a.get("name")] ], function() {
App.game.stackViews[a.get("name")].$el.droppable("option", "disabled", !App.game.stackViews[a.get("name")].canDrop());
})), App.game.stackViews[a.get("name")].render();
};
App.OkeyGame.loadStacks = function() {
var e = "joker_determinant";
this.stacks[e] || (this.stacks[e] = new App.OkeyStackModel({
name: e
})), this.stackViews[e] || (this.stackViews[e] = new (this.stackView())({
model: this.stacks[e],
parent: "#game-canvas",
top: -36,
left: -5,
style: {
position: "absolute"
}
})), this.stacks[e].readCards();
var a = App.current_user.isWatcher() ? 0 : App.current_user.get("index");
_.each(_.range(4), function(e) {
var t = "stack_table_fire_" + e;
this.stacks[t] || (this.stacks[t] = new App.OkeyStackModel({
name: t
}), App.game.stacks[t].on("all", function() {
!App.game.stacks[t].empty() && App.current_user.isPlaying() && (App.game.iSevenPairs() || _.include([ a, (a + 3) % 4 ], e)) ? $("#table_fire_eye_" + e).show() : $("#table_fire_eye_" + e).hide();
})), this.stackViews[t] || (this.stackViews[t] = new (this.stackView())({
id: "table_fire_" + e,
className: "card-stack face-up",
top: [ 35, -100, -100, 35 ][(e + 4 - a) % 4],
left: [ 180, 180, -180, -180 ][(e + 4 - a) % 4],
style: {
position: "absolute"
},
model: this.stacks[t],
ordered: !1,
parent: "#game-canvas",
closed: !0,
draggable: App.current_user.isPlaying() && (e + 1) % 4 === a,
droppable: App.current_user.isPlaying() && e === a,
showEmpty: !0,
canDrop: function() {
return App.game.iStabbed();
}
}), $("<div id='table_fire_eye_" + e + "' rel='tooltip'><i class='fa fa-eye'></i></div>").css({
"font-size": 20,
display: "none",
color: "black",
position: "absolute",
cursor: "pointer",
width: 25,
height: 25,
top: [ 5, -130, -130, 5 ][(e + 4 - a) % 4],
left: [ 135, 135, -167, -167 ][(e + 4 - a) % 4]
}).attr("data-title", G._("click_to_view_stack")).click(function() {
App.stackViewer.activate({
stacks: [ App.game.stacks[t] ],
goingDown: !1
});
}).appendTo("#game-canvas")), this.stacks[t].readCards();
}, this), App.game.cleanBind("change:gs:hs:player_stabbed:" + a, [ App.game.stackViews["stack_table_fire_" + a] ], function() {
App.game.stackViews["stack_table_fire_" + a].$el.droppable("option", "disabled", !App.game.stackViews["stack_table_fire_" + a].canDrop());
}), e = "stack_deck", this.stacks[e] || (this.stacks[e] = new App.OkeyStackModel({
name: e
})), this.stackViews[e] || (this.stackViews[e] = new (this.stackView())({
id: "deck",
className: "card-stack",
model: this.stacks[e],
ordered: !1,
closed: !0,
showEmpty: !0,
parent: "#game-canvas"
})), this.stacks[e].readCards(), _.each(_.range(0, 7), t), _.invoke(this.seats, "loadStacks");
}, App.OkeyGame.SeatViewClass = App.SeatView.extend({}, {
renderStacks: function(e) {
var t = e.playerIndex(), i = e.model.get("position"), r = [], a = App.game.stacks["stack_p_" + t];
App.game.stackViews[a.get("name")] || (App.game.stackViews[a.get("name")] = new (App.game.stackView().PlayerStackView(i))({
model: a,
noReload: !App.current_user.isWatcher() && 0 === i
}), t === App.game.getActingIndex() && App.game.stackViews[a.get("name")].attrs({
draggable: !0,
droppable: !0,
hoverClass: "",
showEmpty: !0
})), r.push(App.game.stackViews[a.get("name")]), _.each(_.range(7 * t, 7 * t + 7), function(e) {
var t, a = Math.floor(e / 7), n = (App.current_user.get("index"), !App.current_user.isWatcher() && a === App.current_user.get("index"));
t = App.game.stacks["stack_ordering_" + e], App.game.stackViews[t.get("name")] || (n && (App.game.stackViews[t.get("name")] = new (App.game.stackView().PlayerStackView(i))({
id: t.get("name"),
className: "ordering on-table",
model: t,
dx: 12,
ordered: !1,
noReload: !0,
parent: "#ordering-stack-container",
dynamicWidth: !0,
canDrop: function() {
var e = App.game.myOrderingStacks();
return 7 !== e.length || _.any(e, function(e) {
return 2 !== e.get("cards").without(App.game.fillerCard).length;
});
},
showEmpty: !0
})), a === App.game.getActingIndex() && App.game.stackViews[t.get("name")].attrs({
draggable: !0,
droppable: !0
})), App.game.stackViews[t.get("name")] && r.push(App.game.stackViews[t.get("name")]);
}), _.invoke(r, "render");
}
});
}(), App.OkeyGame.gameSummaryInfo = function() {
var e = [];
e.push({
label: G._("Round"),
value: parseInt(App.game.read("round"), 10) + 1
});
var t = App.game.read("hs.player_with_other_determinent", -1);
return -1 !== t && e.push({
label: G._("Matching tile with"),
value: App.game.players[t].name()
}), e;
}, App.OkeyGame.iStabbed = function() {
return this.read("hs.player_stabbed", {})[this.getActingIndex()];
}, App.OkeyGame.sevenPairs = function(e) {
return 7 === e.length && _.all(e, function(e) {
return 2 === e.length && (_.any(e, function(e) {
return App.Card.isJoker(e);
}) || App.Card.val(e[0]) === App.Card.val(e[1]));
});
}, App.OkeyGame.canGoDown = function(e) {
return !!this.sevenPairs(e) || !this.iSevenPairs() && 14 === _.flatten(e).length && _.all(e, function(e) {
return 0 < App.game.cardsSum(e);
});
}, App.OkeyGame.cardsSum = function(a) {
for (var n = {
8: 10,
9: 10,
10: 10,
11: 10,
12: 11
}, e = 0; e < 8; e++) n[e] = e + 2;
if (a.length < 3) return 0;
if (1 < _.intersect(a, [ 52, 53 ]).length) return 0;
var t = _.select(a, function(e) {
return !App.Card.isJoker(e);
}), i = _.map(t, function(e) {
return e % 13;
}), r = _.map(t, function(e) {
return parseInt(e / 13, 10);
}), s = 0;
if (1 === _.uniq(r).length && 1 < t.length) {
var o = _.map(_.range(0, 14 - a.length), function(e) {
return _.range(e, e + a.length);
});
o.unshift(_.flatten([ 12, _.range(0, a.length - 1) ]));
var p = [];
if (_.each(_.select(o, function(e) {
return -1 !== _.indexOf(e, i[0]);
}), function(e) {
_.each([ e, _.clone(e).reverse() ], function(e) {
var t = _.map(_.zip(a, e), function(e) {
return !!App.Card.isJoker(e[0]) || e[0] % 13 === e[1];
});
_.all(t, _.identity) && p.push(e);
});
}), !p.length) return 0;
s = _.inject(_.last(p), function(e, t) {
return e + n[t];
}, 0);
} else {
if (1 !== _.uniq(i).length) return 0;
if (_.uniq(a).length !== a.length || 4 < a.length) return 0;
s = n[i[0]] * a.length;
}
return s;
}, App.OkeyGame.noGroups = function() {
return _.all(_.map(this.myOrderingStacks(), function(e) {
return e.empty();
}), _.identity);
}, App.OkeyGame.myOrderingStacks = function() {
return _.select(this.stacks, function(e) {
return e.get("owner") === App.game.getActingIndex() && !e.get("name").match(/^stack_p_(\d+)$/);
});
}, App.OkeyGame.saveOrder = App.HandgameGame.saveOrder, App.OkeyGame.getSavedOrder = App.HandgameGame.getSavedOrder, 
App.OkeyGame.jokerCard = function() {
var e = this.read("hs.stacks.joker_determinant.contains.0") % 54;
return {
suit: Math.floor(e / 13),
rank: (e + 1) % 13
};
}, App.OkeyGame.getNeededStacksFor = function(e, t) {
return 3 <= e ? Math.floor(e / 3) : t ? 1 : 0;
}, App.OkeyGame.arrangeOrderingStacks = function() {
var e, t = this.stacks["stack_p_" + this.getActingIndex()], n = this.myOrderingStacks();
if (_.all(n, function(e) {
return e.get("cards").length < 3;
})) e = 7; else {
var a = _.map(n, function(e) {
return App.game.getNeededStacksFor(e.get("cards").length - 1, !1);
});
e = 5 - _.inject(a, function(e, t) {
return e + t;
}, 0) + _.select(a, function(e) {
return 0 < e;
}).length;
}
var i = _.first(_.sortBy(n, function(e) {
return e.get("cards").length;
}), 7 - e);
_.each(i, function(e) {
e.moveCardsTo(t, {
silent: !0
});
});
var r = [];
_.each(_.range(e), function() {
r.push(new App.CardStack());
});
var s = 0;
_.each(n, function(e) {
0 < e.get("cards").length && (e.moveCardsTo(r[s], {
silent: !0
}), s += 1);
});
var o = !0, p = 0;
_.each(r, function(e) {
var t = App.game.getNeededStacksFor(e.get("cards").length, !0), a = e.get("cards").length;
(0 < a || o) && (0 === a && (o = !1), e.moveCardsTo(n[p], {
silent: !0
}), n[p].set({
hidden: !1
}, {
silent: !0
}), _.each(_.range(p + 1, p + t), function(e) {
n[e].set({
hidden: !0
}, {
silent: !0
});
}), p += t);
}), _.each(_.range(p, 7), function(e) {
n[e].set({
hidden: !0
}, {
silent: !0
});
}), t.get("cards").trigger("reset", t), _.each(n, function(e) {
e.get("cards").trigger("reset", e);
}), App.game.saveOrder();
}, App.OkeyGame.iSevenPairs = function() {
return "7pairs" === this.read("hs.declared_nzools", [])[App.current_user.get("index")];
}, App.OkeyGame.getPlayerCircle = null, App.OkeyGame.scoresTabExtension = {
gameWinner: function(e) {
var t = App.game.scores();
return t[e] === _.max(t);
},
roundWinner: function(e, t, a) {
return e[0][a] === _.max(e[0]);
}
}, App.StackViewer = App.Lightbox.extend({
inGame: !0,
title: G._("Stack Contents"),
template: JST["jsts/games/okey/go_down"],
form: !0,
optional: !0,
footer: [ {
type: "button",
name: "Ok",
action: "cancel"
} ]
}), App.stackViewer = new App.StackViewer({
model: App.game
}), App.OkeyGoDown = App.StackViewer.extend({
title: function() {
return G._(App.game.noGroups() ? "Error" : "Go Down");
},
footer: [ {
type: "a",
name: "Cancel",
action: "cancel"
}, {
type: "button",
name: "Go Down",
action: "goDown",
visible: function() {
return !App.game.noGroups();
}
} ],
goDown: function() {
App.game.canGoDown(_.map(this.params.stacks, function(e) {
return e.getCardVals();
})) ? (this.deactivate(), App.comm.sendGame("go_down", {
groups: _.map(this.params.stacks, function(e) {
return e.get("cards").pluck("id");
})
})) : App.Lightbox.error(G._("Wrong or incomplete groups"));
}
}), App.okeyGoDown = new App.OkeyGoDown({
model: App.game
}), App.OkeyNzoolTypeChoose = App.Lightbox.extend({
inGame: !0,
form: !0,
klass: "form-horizontal",
title: G._("Seven Pairs"),
template: JST["jsts/games/okey/choose_nzool_type"],
footer: [ {
type: "a",
name: "No",
action: "normalNzools"
}, {
type: "button",
name: "Yes",
action: "sevenPairs"
} ],
visible: function() {
return this.model.gameIs("Okey") && this.model.inState("declaring_nzool_type") && !this.model.read("hs.declared_nzools")[App.current_user.get("index")];
},
sevenPairs: function() {
App.comm.sendGame("declare", {
nzool_type: "7pairs"
}), this.deactivate();
},
normalNzools: function() {
App.comm.sendGame("declare", {
nzool_type: "normal"
}), this.deactivate();
}
}, {
monitoredEvents: [ "change:gs:state", "change:gs:hs:declared_nzools" ]
}), App.okeyNzoolTypeChoose = new App.OkeyNzoolTypeChoose({
model: App.game
}), App.OkeyGame.classBind("started", function() {
App.gameActions.addItem({
id: "goDown",
name: "Go Down",
visible: function() {
return App.game.iHaveTurn() && App.game.iStabbed();
},
onClick: function() {
var e = _.select(App.game.myOrderingStacks(), function(e) {
return 0 < e.get("cards").length;
});
App.okeyGoDown.activate({
stacks: _.sortBy(e, function(e) {
return e.get("name");
}),
goingDown: !0
});
},
monitoredEvents: [ "change:gs:hs:player_turn", "change:gs:state", "change:gs:hs:player_stabbed" ]
});
}), App.OkeyGame.gameMessage = function() {
if (this.iHaveTurn()) return this.iStabbed() ? "Throw a card by dragging it to the floor" : "Pick a card by clicking the pack or dragging the card from the floor";
if (this.inState("in_hand")) {
var e = "Organize your cards in the boxes on the table to go down";
return this.iSevenPairs() ? e + ". You must go down with 7 pairs" : e;
}
}, App.TexasGame = App.CardGame.newGameHash(), App.TexasGame.classBind("started change:gs:hs:last_round_bet change:gs:hs:bets", function() {
this.read("hs.bets");
0 === $("#texas-bets").length && $("#game-canvas").append("<div id='texas-bets' />");
var d = $("#texas-bets").empty();
_.each(this.players, function(e) {
var t = App.SeatView.getPlacement(e.position()), a = this.playerBet(e);
0 < a && d.append("<div class='bet-value " + t + "'>" + a + "</div>");
}, this);
var l = this.chipsInPot();
if (0 < l) {
var u = $("<div class='bet-value pot'>" + l + "</div>").appendTo(d), e = this.read("hand_result");
this.inState("hand_more") && e && _.reduce(e.winners, function(e, t) {
var a, n = t[0], i = t[1], r = "player-" + n, s = r + "-pot";
l === i ? a = u.html(i) : (a = $("<div id='" + s + "' class='bet-value pot'>" + i + "</div>").appendTo(d), 
l -= i);
var o = a.offset(), p = $("#" + r), c = p.offset();
return c.top += p.height() / 2, c.left += p.width() / 2, e.pipe(function() {
return a.animate({
top: c.top - o.top,
left: c.left - o.left,
opacity: 0
}, {
duration: 1500
}).promise().pipe(function() {
a.remove();
});
});
}, $.Deferred().resolve());
}
}), App.TexasGame.loadStacks = function() {
var e = "stack_deck";
this.stacks[e] || (this.stacks[e] = new App.CardStack({
name: e
})), this.stacks[e].readCards(), e = "stack_table_flop", this.stacks[e] || (this.stacks[e] = new App.CardStack({
name: e
})), this.stackViews[e] || (this.stackViews[e] = new (this.stackView())({
tagName: "div",
className: "flop card-stack face-up",
model: this.stacks[e],
top: 50,
ordered: !1,
left: -5,
smallFirst: !1,
parent: "#ontable-stack-container"
})), this.stacks[e].readCards(), _.invoke(this.seats, "loadStacks");
}, App.TexasGame.gameSummaryInfo = function() {
return [];
}, App.TexasGame.scores = function() {
return this.read("chips", _.map(_.range(this.read("num_players")), function() {
return 0;
}));
}, App.TexasGame.hideFullScore = !0, App.TexasGame.noLastRound = !0, App.TexasGame.canSit = function(e) {
return 0 < this.read("chips." + e.playerIndex(), 1e3);
}, App.TexasGame.amountToCall = function() {
return this.read("hs.current_bet") - this.read("hs.bets." + App.current_user.get("index"));
}, App.TexasGame.myChips = function() {
return this.read("chips." + App.current_user.get("index"));
}, App.TexasGame.playerClasses = function(e) {
return 0 === this.read("hs.state_in_hand." + e.get("index")) ? "folded" : "";
}, App.TexasGame.playerBet = function(e) {
var t = this.read("hs.bets." + e.get("index")) - this.read("hs.last_round_bet");
return 0 < t ? t : 0;
}, App.TexasGame.chipsInPot = function() {
return _.inject(this.read("hs.bets"), function(e, t) {
return e + _.min([ t, this.read("hs.last_round_bet") ]);
}, 0, this);
}, App.TexasGame.playerCircleMonitoredEVs = function() {
return "change:gs:hs:bets";
}, App.TexasGame.getPlayerCircle = function(e) {
if (this.inState([ "in_hand", "hand_more" ])) {
this.read("num_players");
var t = e.playerIndex(), a = "", n = this.read("hand_result", {
winners: []
}), i = _.include(_.map(n.winners, function(e) {
return e[0];
}), t);
this.inState("hand_more") && i && (a = "positive");
var r = G._("Stack");
return $("<div class='score " + a + "' rel='tooltip' title='" + r + "'>" + this.read("chips." + t, 0) + "</div>");
}
return "";
}, App.TexasGame.scoresTabExtension = {
gameWinner: function(e) {
var t = App.game.scores();
return t[e] === _.max(t);
}
}, App.TexasGame.changeBet = function(e, t) {
t = _.isUndefined(t) ? 5 : t;
var a = Math.min(this.myChips(), this.amountToCall() + 2 * this.read("small_blinds"));
this.raiseAmount || (this.raiseAmount = a);
var n = e * t;
this.raiseAmount = Math.max(Math.min(this.raiseAmount + n, this.myChips()), a), 
$(".seat.current .raise-btn").html(this.raiseText());
}, App.TexasGame.raiseText = function() {
var e = 0 === this.amountToCall() ? "bet_amount" : "raise_amount";
return this.raiseAmount === this.myChips() && (e = "all_in_amount"), G._(e, {
amount: this.raiseAmount
});
}, App.TexasGame.classBind("started change:gs:hs:player_turn", function() {
this.changeBet(1, 0);
}), App.TexasGame.classBind("started", function() {
App.gameActions.numOutside = 6, App.gameActions.addItem({
id: "texasCheckCall",
btnClasses: "btn-other",
name: function() {
var e = App.game.amountToCall();
return 0 === e ? "check" : G._("call_amount", {
amount: e
});
},
visible: function() {
return App.game.iHaveTurn() && App.game.amountToCall() < App.game.myChips();
},
onClick: function() {
App.comm.sendGame("bet", {
bet_action: "call"
});
},
monitoredEvents: [ "change:gs:hs:player_turn", "change:gs:state" ]
}), App.gameActions.addItem({
id: "texasRaiseLess",
btnClasses: "btn-primary raise-modifier",
name: "-",
visible: function() {
return App.game.iHaveTurn() && App.game.amountToCall() < App.game.myChips();
},
monitoredEvents: [ "change:gs:hs:player_turn", "change:gs:state" ]
}), App.gameActions.addItem({
id: "texasRaise",
btnClasses: "btn-primary raise-btn",
name: function() {
return App.game.raiseText();
},
visible: function() {
return App.game.iHaveTurn() && App.game.amountToCall() < App.game.myChips();
},
onClick: function() {
App.comm.sendGame("bet", {
bet_action: "raise",
bet: App.game.raiseAmount
});
},
monitoredEvents: [ "change:gs:hs:player_turn", "change:gs:state" ]
}), App.gameActions.addItem({
id: "texasRaiseMore",
btnClasses: "btn-primary raise-modifier",
name: "+",
visible: function() {
return App.game.iHaveTurn() && App.game.amountToCall() < App.game.myChips();
},
monitoredEvents: [ "change:gs:hs:player_turn", "change:gs:state" ]
}), App.gameActions.addItem({
id: "texasAllIn",
name: "all_in",
visible: function() {
return App.game.iHaveTurn() && App.game.amountToCall() >= App.game.myChips();
},
onClick: function() {
App.comm.sendGame("bet", {
bet_action: "all-in"
});
},
monitoredEvents: [ "change:gs:hs:player_turn", "change:gs:state" ]
}), App.gameActions.addItem({
id: "texasFold",
name: "fold",
btnClasses: "btn-other",
visible: function() {
return App.game.iHaveTurn();
},
onClick: function() {
App.comm.sendGame("bet", {
bet_action: "fold"
});
},
monitoredEvents: [ "change:gs:hs:player_turn", "change:gs:state" ]
}), $("#game-canvas").on("mousedown", ".raise-modifier", function() {
if (!App.game.btnHoldTimer) {
var e = "texasRaiseLess" === $(this).data("item") ? -1 : 1;
App.game.changeBet(e);
var t = 0, a = 5;
App.game.btnHoldTimer = setInterval(function() {
(t += 1) % 3 == 0 && (a += 10), App.game.changeBet(e, a);
}, 100);
}
}), $("#game-canvas").on("mouseup mouseout", ".raise-modifier", function() {
App.game.btnHoldTimer && (clearInterval(App.game.btnHoldTimer), App.game.btnHoldTimer = null);
});
}), App.TexasGame.gameMessage = function() {
if (this.inState("hand_more")) {
var e = this.read("timeouts")[this.read("dealer")], t = G._("dealing_shortly", {
remaining: e
}), a = setInterval(function() {
0 < (e -= 1) ? $("#game-message").html(G._("dealing_shortly", {
remaining: e
})) : ($("#game-message").html(G._("dealing_now")), clearInterval(a));
}, 1e3);
return t;
}
}, App.TexasGame.classBind("started change:gs:winning_hand", function() {
var e = this.read("winning_hand");
if ($("#winning-hand-type").remove(), e) {
var t = e[0];
$("#game-canvas").append("<div id='winning-hand-type'>" + G._(t) + "</div>");
}
}), App.TexasGame.classBind("change:gs:hs:state_in_hand", function() {
_.invoke(this.seats, "playerChange"), this.raiseAmount = Math.min(this.myChips(), this.amountToCall() + 2 * this.read("small_blinds"));
}), App.TexasGame.classBind("change:gs:small_blinds", function() {
App.Lightbox.alert(G._("new_blinds", {
small_blinds: this.read("small_blinds"),
big_blinds: 2 * this.read("small_blinds")
}), {
title: G._("blinds_doubled")
});
}), App.TexasGame.classBind("change:gs:hs:state_in_hand", function() {
if (this.inState("in_hand")) {
var e = this.readOld("hs.player_turn"), t = this.read("hs.state_in_hand")[e];
if (0 === t) this.vaporize(e, G._("folded")); else if (2 === t) {
var a = this.readOld("hs.bets")[e], n = this.read("hs.bets")[e], i = this.readOld("hs.current_bet"), r = this.read("hs.current_bet"), s = this.read("chips")[e];
i && r && (0 === s ? this.vaporize(e, G._("went_all_in")) : i === r ? this.vaporize(e, G._(a === n ? "checked" : "called")) : i < r && this.vaporize(e, G._("raised_by_amount", {
raise: r - i
})));
}
}
}), App.KasraGame = App.CardGame.newGameHash(App.TrixGame), App.KasraGame.KasraStack = App.StackView.extend({
canBeDoubled: function(e) {
var t = e.val();
if (e.stack().get("name").match(/^stack_p_/)) switch (App.game.handName()) {
case "complex":
return t % 13 == 10 || 11 === t;
}
return !1;
},
findDestinationStack: {
tarneeb: function() {
return "stack_table";
},
ltoosh: function() {
return "stack_table";
},
complex: function() {
return "stack_table";
},
trix: function(e) {
var t, a, n = e, i = Math.floor(n / 13);
if (n % 13 == 9) {
for (a = 0; a < 4; a++) if (!App.game.stacks["stack_t_" + a].get("cards").length) return "stack_t_" + a.toString();
} else {
var r = function(e, t) {
return e - t;
};
for (a = 0; a < 4; a++) if ((t = App.game.stacks["stack_t_" + a].get("cards").invoke("val").sort(r)).length && i === Math.floor(t[0] / 13) && (n === t[0] - 1 || n === t[t.length - 1] + 1)) return "stack_t_" + a.toString();
}
return !1;
}
},
canPlay: function(e, t) {
if (t.owner() !== App.game.getActingIndex()) return !1;
switch (App.game.read("state").toString()) {
case "in_hand":
if (!App.game.playerHasTurn(App.game.getActingIndex())) return !1;
if (App.game.inHand("trix")) {
for (var a = 0; a < 4; a++) if (!App.game.stacks["stack_t_" + a].isUpToDate()) return !1;
if (!this.findDestinationStack.trix(e.val())) return !1;
} else {
var n, i = App.game.stacks.stack_table;
if (!i.isUpToDate()) return !1;
if (!i.empty() && (n = Math.floor(i.get("cards").first().val() / 13)) !== Math.floor(e.val() / 13) && _.any(_.map(App.game.stacks["stack_p_" + App.game.getActingIndex()].allCards(), function(e) {
return Math.floor(e.val() / 13) === n;
}), _.identity)) return !1;
}
break;

case "hand_more":
if (!this.canBeDoubled(e)) return !1;
break;

default:
return !1;
}
return !0;
},
onClick: function(e, t) {
switch (App.game.read("state").toString()) {
case "in_hand":
var a = [ "move", t.get("name"), this.findDestinationStack[App.game.handName()](e.id), e.id ];
App.commander.performCmdExternal(a), App.comm.moveCard(a[3], a[1], a[2]);
break;

case "hand_more":
App.UIManager.tempDoublingCard = e, App.confirmDoubling.activate();
break;

default:
return !1;
}
}
}), App.KasraGame.playerIsBidder = function(e) {
return this.read("hs.bidder") === e;
}, App.KasraGame.iAmNextBidder = function() {
return this.read("hs.next_bidder") === this.getActingIndex() && !App.current_user.isWatcher();
}, App.KasraGame.iAmBidder = function() {
return this.read("hs.bidder") === this.getActingIndex() && !App.current_user.isWatcher();
}, App.KasraGame.bidText = function(e) {
return e;
}, App.KasraGame.passText = function() {
return G._("tarneeb.pass");
}, App.KasraGame.trumpText = function() {
return G._("Trump");
}, App.KasraGame.suitText = function(e) {
var t = [ "Hearts", "Spades", "Diamonds", "Clubs" ];
return G._(t[e]);
}, App.KasraGame.chooseTrumpText = function() {
return G._("Choose your tarneeb");
}, App.KasraTarneebChoose = App.Lightbox.extend({
inGame: !0,
form: !0,
klass: "form-horizontal",
title: App.TarneebGame.trumpText(),
template: JST["jsts/games/tarneeb/tarneeb"],
footer: [ {
type: "button",
name: "Choose",
action: "tarneebGo"
} ],
visible: function() {
return "tarneeb" == App.game.handName() && this.model.inState("hand_more") && _.isFunction(this.model.iAmBidder) && this.model.iAmBidder() && _.all(this.model.read("hs.finished_bidding"), _.identity) && !App.game.gameIs("TarneebEgyptian") && !App.game.gameIs("Estimation");
},
tarneebGo: function() {
this.selectedRadioValue("tarneebSuit") && (App.comm.sendGame("tarneeb", {
tarneeb: this.selectedRadioValue("tarneebSuit")
}), this.deactivate());
}
}, {
monitoredEvents: [ "change:gs:state", "change:gs:hs:bidder", "change:gs:hs:finished_bidding" ]
}), App.kasraTarneebChoose = new App.KasraTarneebChoose({
model: App.game
}), App.KasraGame.handsPerKingdom = function() {
return 4;
}, App.KasraGame.classBind("change:gs", function() {
if ("tarneeb" == App.game.handName() && "hand_more" === this.readOld("state")) if (_.all(this.readOld("hs.finished_bidding"), _.identity) && this.hasKey("hs.tarneeb")) {
var e = this.readOld("hs.bidder");
this.vaporize(e, this.suitText(this.read("hs.tarneeb")));
} else {
var t = this.readOld("hs.next_bidder");
this.isChanged("hs.bid") ? this.vaporize(t, this.bidText(this.read("hs.bid")).toString()) : this.isChanged("hs.finished_bidding") && this.vaporize(t, this.passText());
}
}, "tarneeb-vapor"), App.KasraGame.stackView = function() {
return App.KasraGame.KasraStack;
}, App.KasraPartnerGame = App.CardGame.newGameHash(App.KasraGame), App.KasraPartnerGame.iAmPartnerChooser = App.TarneebGame.iAmPartnerChooser, 
App.KasraPartnerGame.iAmPartnerAccepter = App.TarneebGame.iAmPartnerAccepter, App.KasraPartnerGame.scoresTabExtension = App.TrixPartnerGame.scoresTabExtension, 
$(function() {
App.game.on("started", function() {
var e = App.game.sponsor();
e && (e.id ? $("#game-sponsor").attr("style", "background-image: url(" + App.CardGame.sponsorCompImgURL(e.id, "logo") + ")") : e.game_canvas && $("#game-sponsor").attr("style", "background-image: url(" + App.CardGame.sponsorImgURL(e.name, "game-canvas") + ")"));
});
}), App.friendsGuider = function() {
var e = function() {
guiders.hideAll(), App.eraseCookie("show_friends_guider");
}, n = {
id: "add_friends",
buttons: [ {
name: G._("OK"),
classString: "btn btn-small btn-light",
onclick: e
} ],
description: G._("guiders.friends"),
title: "",
autoFocus: !0,
overlay: !1,
numShown: 0,
maxNumShow: 1,
onHide: App.Lightbox.showAll,
classString: ""
}, t = function() {
var e = _.find(App.game.seats, function(e) {
var t = e.get("player");
return !t.isMe() && t.isHuman();
});
if (e) {
var t, a = "#player-" + e.get("player").get("index");
return t = $(a).parent().hasClass("left") ? 3 : $(a).parent().hasClass("right") ? 9 : $(a).parent().hasClass("top") ? 6 : 12, 
_.extend(n, {
attachTo: a,
highlight: a,
position: t
});
}
}, a = function() {
guiders.hideAll();
var e = t();
App.readCookie("show_friends_guider") && e && (App.Lightbox.hideAll(), guiders.createGuider(e), 
guiders.show(e.id), e.numShown += 1);
};
App.game.cleanBind("start-friends-guider change:gs:players_info", [], function() {
_.defer(a);
}, this), App.game.trigger("start-friends-guider");
}, $(function() {
$("body").on("click", ".box-close", function(e) {
e.preventDefault(), App.comm.enqueue("animator", "unset_item", [ App.game.gid ]), 
$(".tooltip").remove();
}), $("body").on("click", ".store-center [data-toggle]", function(e) {
e.preventDefault(), e.stopPropagation();
var t = $(this).attr("id");
"tog-sticker" === t ? ($(".stick-tab").addClass("active"), $(".gift-tab").removeClass("active")) : "tog-gift" === t && ($(".stick-tab").removeClass("active"), 
$(".gift-tab").addClass("active"));
}), $("body").on("click", ".store-center [data-item]", function(e) {
e.preventDefault();
var t = $(this).data("item"), a = App.current_user.get("game_items"), n = App.current_user;
if (n.isGuest()) App.mustLoginLB.activate(); else {
var i, r = $(this).data("id"), s = App.ItemsManager.getItem(t), o = (App.game.gameItems, 
_.find(Consts.items, function(e) {
return "youtube" === e.name;
}));
if (!$("#emo-box-" + r).hasClass("show") || "web_emote" !== s.applies_on) if (0 !== s.price) if (a[t] || n.get("game_tokens") >= s.price) if (t === o.id) App.Lightbox.create({
optional: !0,
backdrop: !0,
form: !0,
template: JST["jsts/hands/youtube_link"],
title: G._("items.youtube.lb.title"),
klass: "form-horizontal",
footer: [ {
type: "a",
name: "Cancel",
action: "cancel"
}, {
type: "button",
name: "Add",
action: "add"
} ],
events: {
"click [data-action]": "runAction"
},
activate: function() {
App.Lightbox.prototype.activate.apply(this, arguments), $.validator.addMethod("validYoutubeURL", function(e) {
return /\?v=([A-Za-z0-9\_\-]*)/.test(e);
}), this.setValidations();
},
setValidations: function() {
this.$("form").validate({
rules: {
url: {
required: !0,
url: !0,
validYoutubeURL: !0
}
},
messages: {
url: {
required: G._("cannot be empty"),
url: G._("items.youtube.validations.url"),
validYoutubeURL: G._("items.youtube.validations.url")
}
}
});
},
add: function() {
var e = this.$("form").find("[name='url']").val();
/\?v=([A-Za-z0-9\_\-]*)/.test(e) && (i = e.match(/\?v=([A-Za-z0-9\_\-]*)/)[1], App.comm.enqueue("animator", "use_item", [ App.game.gid, t, r, i ])), 
this.deactivate();
}
}).activate(); else App.comm.enqueue("animator", "use_item", [ App.game.gid, t, r, i ]); else App.notEnoughTokens.activate(); else App.comm.enqueue("animator", "use_item", [ App.game.gid, t, r, i ]);
}
}), App.comm.registerCallback("itemUsed", function(e) {
if (e.game_id === App.game.gid) {
var t = App.ItemsManager.getItem(e.item_id), a = e.src_id, n = e.target_id, i = e.video_id, r = App.current_user, s = r.get("game_items"), o = _.find(App.game.read("players_info"), function(e) {
return e.id === a;
});
if (0 !== t.price && a === r.get("id")) {
if (s[t.id] && 0 < s[t.id]) s[t.id] -= 1, r.set("items", s); else {
var p = r.get("game_tokens");
r.set("game_tokens", p - t.price);
}
_.invoke(App.game.seatViews, "renderGameStore"), App.game.trigger("change:gs");
}
if ("web_emote" === t.applies_on) {
var c = $("#gift-box-" + n), d = $("#emo-box-" + n);
if (d.hasClass("show")) return;
var l = c.hasClass("hidden"), u = App.ItemsManager.getBgURL(t.id, {
"background-size": "100%",
transition: "0.5s"
});
d.attr("style", u), d.addClass("animated tada show").removeClass("hidden"), l || c.removeClass("show").addClass("hidden"), 
d.attr("data-original-title", G._("items.from") + " " + o.login), setTimeout(function() {
l || c.addClass("show").removeClass("hidden"), d.removeClass("animated tada show").addClass("hidden");
}, 5e3);
} else {
App.game.gameItems[n] = {
item_id: t.id,
login: o.login,
video_id: i
}, _.find(App.game.seatViews, function(e) {
return e.model.get("player").id === n;
}).renderItems(), $("#gift-box-" + n).addClass("animated tada");
}
}
}), App.comm.registerCallback("gameItems", function(e) {
if (e.game_id === App.game.gid) {
delete e.game_id;
var t = e.target_id;
if (delete e.target_id, App.game.gameItems = e, t) _.find(App.game.seatViews, function(e) {
return e.model.get("player").id === t;
}).renderItems(); else _.invoke(App.game.seatViews, "renderItems");
}
}), App.game.on("started", function() {
App.game.isNormalGame() && App.comm.enqueue("animator", "game_items", [ App.game.gid, !1, null ]);
});
}), $(function() {
function a() {
App.Lightbox.activate({
title: G._("only_mobile_game"),
klass: "form-horizontal blocks-for-errors",
footer: [ {
type: "button",
name: "app_store",
action: "go"
} ],
content: function() {
return $("<div>").append(G._("only_mobile_game_content")).html();
},
go: function(e) {
e.preventDefault(), window.location.href = "/" + G.lang() + "/mobile/";
}
});
}
$("a[href='#new-game-modal']").live("click", function(e) {
var t = App.camelize(App.gameList.get("game_module"));
Consts.mobile_only_games.includes(t) ? a() : (App.Lightbox.activate({
optional: !0,
backdrop: !0,
template: JST["jsts/games/new"],
title: G._("new_game_lb_title", {
gm: G._(App.toCapital(App.gameList.get("game_module")))
}),
form: !0,
klass: "form-horizontal blocks-for-errors",
footer: [ {
type: "a",
name: "Cancel",
action: "cancel"
}, {
type: "button",
name: "Create Game",
action: "create"
} ],
name: function() {
return "newGame";
},
activate: function() {
App.Lightbox.prototype.activate.apply(this, arguments), this.$("#creation-logged-in").attr("class", this.$("#noGuestsCB").attr("checked") ? "active" : ""), 
this.$el.on("show", _.bind(function() {
this.$("[data-action=create]").removeClass("disabled").find(".loadingGif").remove();
}, this));
},
events: {
activated: "bindValidations",
"click [data-action]": "runAction",
"click input": "changeHeaderIcons",
"change #newGameModule": "toggleNumPlayers",
"change #newGameLevel": "changeHeaderGameLevel",
"change #passwordProtected": "togglePrivate",
"change #punishable": "togglePunishable",
"change #groupOnlyCB": "toggleGroupOnlyCB"
},
bindValidations: function() {
this.$("form").validate({
rules: {
newGamePassword: {
required: !0
}
},
messages: {
newGamePassword: {
required: G._("Cannot be empty")
}
}
});
},
toggleNumPlayers: function(e) {
var t = $(e.target).val();
App.gameList.hasVariableNumSeats(t) ? this.$("#numPlayersContainer").show() : this.$("#numPlayersContainer").hide();
},
togglePrivate: function(e) {
var t = $(e.currentTarget).is(":checked");
this.$("#newGamePassword").attr("disabled", !t).val(""), this.$("#freeChat").attr("checked", t), 
!t && this.$("form").valid() && this.$("form .error").removeClass("error");
},
togglePunishable: function(e) {
var t = $(e.currentTarget).is(":checked");
this.$("#noKickOrReseat").attr("checked", t).attr("disabled", t), this.$("#noGuestsCB").attr("checked", t).attr("disabled", t);
},
toggleGroupOnlyCB: function(e) {
var t = $(e.currentTarget).is(":checked");
this.$("#noGuestsCB").attr("checked", t).attr("disabled", t);
},
showAdvanced: function(e) {
var t = this.$("#advancedBox").toggle().is(":visible");
$(e.currentTarget).find("span").html(t ? "-" : "+"), this.$("#advancedBox input[type='checkbox']").attr("checked", !1), 
this.$("#advancedBox #newGameLevel").val(0), this.$("#advancedBox #newGamePassword").val("");
},
changeHeaderIcons: function(e) {
var t = $(e.currentTarget);
if ("newGameTimeout" === t.attr("class")) switch (t.attr("value")) {
case "8":
this.$("#creation-game-speed i").attr("class", "jicon-fast-speed");
break;

case "20":
this.$("#creation-game-speed i").attr("class", "jicon-medium-speed");
break;

case "45":
this.$("#creation-game-speed i").attr("class", "jicon-slow-speed");
break;

default:
this.$("#creation-game-speed i").attr("class", "jicon-medium-speed");
} else switch (t.attr("id")) {
case "noGuestsCB":
this.$("#creation-logged-in").attr("class", t.attr("checked") ? "active" : "");
break;

case "groupOnlyCB":
this.$("#creation-group-only").attr("class", t.attr("checked") ? "active" : ""), 
this.$("#creation-logged-in").attr("class", t.attr("checked") ? "active" : "");
break;

case "noKickOrReseat":
this.$("#creation-no-kicking").attr("class", t.attr("checked") ? "active" : "");
break;

case "punishable":
this.$("#creation-logged-in").attr("class", t.attr("checked") ? "active" : ""), 
this.$("#creation-no-kicking").attr("class", t.attr("checked") ? "active" : ""), 
this.$("#creation-no-leaving").attr("class", t.attr("checked") ? "active" : "");
break;

case "passwordProtected":
this.$("#creation-private").attr("class", t.attr("checked") ? "active" : "");
}
},
changeHeaderGameLevel: function(e) {
var t = $(e.target).val();
t <= "1" ? $("#creation-min-level").length && this.$("#creation-min-level").remove() : $("#creation-min-level").length ? this.$("#creation-min-level div").html(t) : this.$(".game-icons").append('<li id="creation-min-level"><div class="summary-icon">' + t + "</div></li>"), 
this.$("#noGuestsCB").attr("checked", "1" < t).attr("disabled", "1" < t), this.$("#creation-logged-in").attr("class", "1" < t ? "active" : "");
},
create: function() {
if (this.$("form").valid()) {
var e = $("#newGameModule").val(), t = {
game_options: {
play_timeout: $(".newGameTimeout:checked").val(),
final_score: $(".newGameFinalScore:checked").val()
},
password: $("#newGamePassword").val(),
by_level: $("#newGameLevel").val(),
no_guests: $("#noGuestsCB").is(":checked"),
group_only: $("#groupOnlyCB").is(":checked"),
no_kick_or_reseat: $("#noKickOrReseat").is(":checked"),
punishable: $("#punishable").is(":checked"),
free_chat: $("#freeChat").is(":checked"),
white_label_id: App.whiteLabel.id,
ref: window.location.href,
gm: App.gameList.get("game_module")
};
App.gameList.hasVariableNumSeats(e) && (t.num_players = $("#newGameNumPlayers").val()), 
App.comm.enqueue("engine", "create_game_state", [ 0, e, JSON.stringify(t) ]), this.$("[data-action=create]").addClass("disabled").append("<img class='loadingGif' src='/images/loading.gif' />");
}
}
}), $("#creation-game-speed").attr("class", "active"), e.preventDefault());
});
var e = Backbone.View.extend({
events: {
"click [data-action]": "runAction"
},
runAction: function(e) {
e.preventDefault(), this[$(e.currentTarget).data("action")](e);
},
initialize: function() {
this.model.on("change:currentGame", this.render, this);
},
render: function() {
this.$el.html(JST["jsts/games/play_now"]()).addClass("translucent");
},
backToGame: function(e) {
var t = $(e.target).data("game-id"), a = "/" + G.lang() + "/games/" + t;
App.gamesRouter.navigate(a, {
trigger: !0
});
},
playNow: function(e) {
var t = App.camelize(App.gameList.get("game_module"));
Consts.mobile_only_games.includes(t) ? a() : 0 === e.clientX && 0 === e.clientY || (App.current_user.isGuest() ? App.mustLoginLB.activate() : (App.comm.enqueue("engine", "play_now", [ 0, App.toCamel(App.gameList.get("game_module")), {
wl_id: App.whiteLabel.id,
ref: window.location.href,
gm: App.gameList.get("game_module")
} ]), this.$el.find("a").hide(), this.$el.find("img[alt=Loading]").show()));
},
leaveGame: function(e) {
var t = $(e.target).data("game-id");
App.comm.enqueue("engine", "update_game_state", [ t, {
action: "leave",
ref: "game_index"
} ]), this.model.set("currentGame", null);
}
});
App.playNowView = new e({
model: App.current_user,
el: $(".game-random")
}), App.comm.registerCallback("currentGame", _.bind(function(e) {
App.current_user.set("currentGame", e);
}, this)), startGuiders("bg_game_index_1");
});