# Linear create branch

Works with [linear.app](linear.app).

When clicking on the branch icon in linear: Copy a `git checkout -b $name` with a custom branch name format.

![Linear copy branch icon](./assets/linear.png)

## Install

https://github.com/shiftgeist/linear-create-branch/raw/refs/heads/main/dist/linear-create-branch.user.js

## Branch name format

```
$TYPE-$ISSUE_ID-$TITLE
```

Type is currently set strictly to `feat`.

## Dev Hints

Don't forget to update version in `deno.json` for auto updates.
