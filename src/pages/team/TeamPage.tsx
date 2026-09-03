import { SectionHeading } from "@/components/common/SectionHeading/SectionHeading";
import { OfficeSequence } from "@/components/team/OfficeSequence/OfficeSequence";
import { WingIntro } from "@/components/team/WingIntro/WingIntro";
import { OFFICES, WINGS, WING_INTRO } from "@/data/offices";
import styles from "@/styles/page.module.css";
import team from "@/components/team/styles/team.module.css";

export function TeamPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <SectionHeading
          as="h1"
          eyebrow="DIMISI Headquarters"
          title="Walk the corridor"
          description="Keep scrolling and the corridor moves with you. Each smart-glass door unlocks on approach, opens onto that person's workspace, and closes again as the tour continues — CEO to intern."
        />
      </section>

      <div className={team.corridor}>
        {WINGS.map((wing) => {
          const intro = WING_INTRO[wing]!;
          const rooms = OFFICES.filter((o) => o.wing === wing);
          return (
            <div key={wing}>
              <WingIntro eyebrow={intro.eyebrow} title={intro.title} text={intro.text} />
              {rooms.map((office) => (
                <OfficeSequence
                  key={office.no}
                  office={office}
                  index={Number(office.no) - 1}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
