# 로컬 설치 가이드 (사용자 PC에서 실행)

Claude 샌드박스에서는 Expo·Next.js 의존성 풀 설치가 디스크·네트워크 한계로 어렵습니다.
김연재님 PC에서 아래 1회 실행하여 `pnpm-lock.yaml` 생성 후 커밋하면 CI가 그린이 됩니다.

```bash
# 1. pnpm 설치
npm install -g pnpm@9.12.0

# 2. 프로젝트 폴더에서
cd <ilgam 폴더>
pnpm install

# 3. 생성된 lockfile 커밋
git add pnpm-lock.yaml
git commit -m "chore: pnpm-lock.yaml (initial install)"
git push origin main

# 4. 검증
pnpm typecheck
pnpm lint
pnpm dev:web   # http://localhost:3000 에서 마케팅 홈 확인
```

## 트러블슈팅

- `node-gyp` 에러 시 Windows는 `npm i -g windows-build-tools`, Mac은 Xcode Command Line Tools
- Expo dev build는 최초 1회 Android Studio 또는 Xcode Simulator 필요
- Supabase CLI는 별도: `npm i -g supabase` 후 `supabase login`
