# SSH Keys

You can use a [personal key](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh) or [deploy keys](https://docs.github.com/en/developers/overview/managing-deploy-keys).

If using a personal key, you can use the same key for both repositories.

If using deploy keys, **you will need two**:

- One with write access to SoT
- One with write access to Destination

> The recommended way is to use deploy keys

## Usage

Depending on your choice, you will need to attach the **public key** to a user (personal key) or a repository (deploy key).

In both your SoT and destination repos, add a new secret `SSH_KEY` and copy the **private key** as the value.

## Generate a private/public key pair

![it works on my machine](images/works-on-my-machine.png)

```sh
ssh-keygen -N "" -m PEM -t rsa -f temp_key -q

echo "\n\nPrivate key to copy in the SSH_KEY secret of first repo:\n\n"
cat temp_key

echo "\n\n\n\nPublic key to copy in your profile or as a deploy key of second repo (with write access):\n\n"
cat temp_key.pub

rm -rf temp_key temp_key.pub
```
