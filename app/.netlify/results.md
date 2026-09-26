# Staging workflow: dev branch + Netlify Branch Deploys

## 1. Creating and pushing the `dev` branch

This agent session only has read-only git access in this environment (branch creation and pushes are disabled here), so the branch needs to be created from your own machine or terminal with push access to the repository. Run:

```bash
git checkout main
git pull origin main
git checkout -b dev
git push -u origin dev
```

This creates `dev` from the current tip of `main` and publishes it to the remote so Netlify can see it.

## 2. Enabling Branch Deploys for `dev` in Netlify

1. Log in to [app.netlify.com](https://app.netlify.com) and open your site.
2. Go to **Site configuration** → **Build & deploy** → **Continuous deployment**.
3. Under **Branch deploys**, click **Edit settings** (or **Configure branch deploys**).
4. Choose **Let me add individual branches** (rather than "All" or "None").
5. Enter `dev` in the branch name field and save.
6. Push a commit to `dev` — Netlify will automatically build it and generate a unique **branch deploy URL** in the form `dev--your-site-name.netlify.app`.
7. Optional: under **Deploy Previews**, keep pull request previews enabled too, so any PR opened from `dev` (or feature branches) into `main` also gets its own preview URL for review before merging.

Production deploys stay tied to `main` (unchanged), so nothing about your live site's deploy trigger needs to change.

## 3. The resulting workflow

- Do day-to-day development and commits on `dev` (or short-lived feature branches merged into `dev`).
- Every push to `dev` triggers an isolated Netlify branch deploy at its own URL, built with the same config as production but never affecting the live site at your primary domain.
- Use that branch deploy URL to test changes end-to-end — including real Netlify features like functions, redirects, and environment variables — exactly as they'd behave in production.
- When `dev` is verified and ready to ship, open a pull request from `dev` into `main` (Netlify will also generate a deploy preview for the PR itself), get it reviewed, then merge.
- Merging into `main` triggers the normal production deploy, promoting exactly the code that was already tested on the branch deploy — nothing new is built blind.
