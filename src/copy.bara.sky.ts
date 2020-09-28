export const copyBaraSky = (
  sotRepo: string,
  sotBranch: string,
  destinationRepo: string,
  destinationBranch: string,
  committer: string,
  localSot: string,
  pushInclude: string,
  pushExclude: string,
  pushTransformations: string,
  prInclude: string,
  prExclude: string,
  prTransformations: string
) => `
# Variables
SOT_REPO = "${sotRepo}"
SOT_BRANCH = "${sotBranch}"
DESTINATION_REPO = "${destinationRepo}"
DESTINATION_BRANCH = "${destinationBranch}"
COMMITTER = "${committer}"
LOCAL_SOT = "${localSot}"

PUSH_INCLUDE = [${pushInclude}]
PUSH_EXCLUDE = [${pushExclude}]
PUSH_TRANSFORMATIONS = [${pushTransformations}
]

PR_INCLUDE = [${prInclude}]
PR_EXCLUDE = [${prExclude}]
PR_TRANSFORMATIONS = [${prTransformations}
]

# Push workflow
core.workflow(
    name = "push",
    origin = git.origin(
        url = LOCAL_SOT if LOCAL_SOT else SOT_REPO,
        ref = SOT_BRANCH,
    ),
    destination = git.github_destination(
        url = DESTINATION_REPO,
        push = DESTINATION_BRANCH,
    ),
    origin_files = glob(PUSH_INCLUDE, exclude = PUSH_EXCLUDE),
    authoring = authoring.pass_thru(default = COMMITTER),
    mode = "ITERATIVE",
    transformations = [
        metadata.restore_author("ORIGINAL_AUTHOR", search_all_changes = True),
        metadata.expose_label("COPYBARA_INTEGRATE_REVIEW"),
    ] + PUSH_TRANSFORMATIONS if PUSH_TRANSFORMATIONS else core.reverse(PR_TRANSFORMATIONS),
)

# Pull Request workflow
core.workflow(
    name = "pr",
    origin = git.github_pr_origin(
        url = DESTINATION_REPO,
        branch = DESTINATION_BRANCH,
    ),
    destination = git.github_pr_destination(
        url = SOT_REPO,
        destination_ref = SOT_BRANCH,
        integrates = [],
    ),
    destination_files = glob(PUSH_INCLUDE, exclude = PUSH_EXCLUDE),
    origin_files = glob(PR_INCLUDE if PR_INCLUDE else ["**"], exclude = PR_EXCLUDE),
    authoring = authoring.pass_thru(default = COMMITTER),
    mode = "CHANGE_REQUEST",
    set_rev_id = False,
    transformations = [
        metadata.save_author("ORIGINAL_AUTHOR"),
        metadata.expose_label("GITHUB_PR_NUMBER", new_name = "Closes", separator = DESTINATION_REPO.replace("git@github.com:", " ").replace(".git", "#")),
    ] + PR_TRANSFORMATIONS,
)
`;
