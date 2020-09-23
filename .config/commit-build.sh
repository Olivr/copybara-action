# This script is used for repos that need to commit a build folder (eg. Github actions)

# Add more sources/destinations by separating them by spaces (ie. source="src lib")
source="src"
build="dist"

# If some changes in $source are staged
if [[ $(git status --porcelain $source | egrep '^M') ]]

then

  # Run build command
  echo "Verifying $build is built and committed..."
  yarn build -q
  
  # If this generated unstaged changes in $build folder(s)
  if [[ $(git status --porcelain $build | egrep '^(([M ]M)|\?\?)') ]]

  then

    yarn test
    git add $build
    echo "ℹ️  Added $build to your commit"
    
  fi

fi