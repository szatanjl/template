var spawnSync = require("node:child_process").spawnSync;
var core = require("@actions/core");

var commit = core.getInput("commit");
var checkout_dir = core.getInput("checkout");
var repo_url = core.getInput("repo_url");

function run(cmd, args, cwd)
{
	var result = spawnSync(cmd, args, {
		cwd: cwd || ".",
		stdio: "inherit"
	});
	if (result.status !== 0 || result.error != null) {
		throw result.error || Error("Command failed (" + result.status + "): " + cmd + args);
	}
}

function checkout(repo_url, commit, dir)
{
	if (dir === "") {
		return;
	}

	core.startGroup("Checkout project code");
	run("git", ["claone", "-n", "--filter=tree:0", "--progress",
	            "--", repo_url, dir]);
	run("git", ["checkout", "--recurse-submodules", "--progress",
	            commit, "--"], dir);
	run("make", ["version"], dir);
	core.endGroup()

	core.startGroup("Generated version information");
	run("sed", ["/^$/q", "version.mk"], dir);
	core.endGroup()
}

checkout(repo_url, commit, checkout_dir);
