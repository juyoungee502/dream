import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AppShell } from "@/src/components/AppShell";
import doneCharacter from "@/src/img/done-character.png";
import styles from "./done.module.css";

type DonePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DonePage({ searchParams }: DonePageProps) {
  const params = await searchParams;
  const attendanceId = typeof params.attendanceId === "string" ? params.attendanceId : "";

  if (!attendanceId) {
    redirect("/check-in");
  }

  return (
    <AppShell status="출석 완료">
      <section className={`soft-card ${styles.card}`}>
        <div className={styles.visual}>
          <Image
            src={doneCharacter}
            alt="초록색 옷을 입고 가방을 멘 캐릭터"
            className={styles.character}
            sizes="(max-width: 430px) 48vw, 210px"
            preload
          />
          <span className={styles.check} aria-label="출석 확인 완료">
            ✓
          </span>
        </div>
        <h1 className={styles.title}>출석 완료!</h1>
        <p className={styles.description}>
          오늘 산모임 출석이 완료되었어요.
          <br />
          관리자가 조를 매칭하면 결과를 볼 수 있어요.
        </p>
        <Link
          className={`btn btn-primary ${styles.button}`}
          href={`/waiting?attendanceId=${encodeURIComponent(attendanceId)}`}
        >
          조 편성 기다리기
        </Link>
      </section>
    </AppShell>
  );
}
