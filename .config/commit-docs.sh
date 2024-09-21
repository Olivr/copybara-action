# Copied from commit-build.sh
# This script is used for repos that need to commit a build folder (eg. Github actions)

# Add more sources/destinations by separating them by spaces (ie. source="src lib")
source="action.yml"
build="docs/inputs.md"

# If some changes in $source are staged
if [[ $(git status --porcelain $source | egrep '^M') ]]

then

  # Run build command
  echo "Generating $build..."
  node .config/autodoc.mjs
  
  # If this generated unstaged changes in $build folder(s)
  if [[ $(git status --porcelain $build | egrep '^(([M ]M)|\?\?)') ]]

  then

    git add $build
    echo "ℹ️  Added $build to your commit"
    
  fi

fi