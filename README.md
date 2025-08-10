# gitely

`gitely` is a CLI tool that gamifies your Git workflow to make coding more fun
and you more productive.

Just like in your favorite video game, you earn XP and level up by committing
code. Soon, you'll also be rewarded for daily streaks and other Git activities
(such as completed PRs).

## Requirements

To start using `gitely`, a local Git repository is required.

## Installation

```sh
curl -fsSL https://raw.githubusercontent.com/plesioo/gitely/main/install.sh | bash
```

## Usage

Navigate to your Git repository and run:

```sh
gitely install
```

This creates a Git hook that will run `gitely` every time you make a commit.

After each commit made through the terminal, your earned XP and any potential
level-up will be displayed. If you're using third-party Git tools (like GitHub
Desktop), this output won't appear.

Nevertheless, to view your current stats, use:

```sh
gitely status
```

To remove `gitely` from your Git repository, run:

```sh
$ gitely uninstall
```
