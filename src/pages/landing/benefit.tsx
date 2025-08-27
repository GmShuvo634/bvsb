import styles from './home.module.css';
export default function Benefit() {
    return (
        <div className={styles.section_keys}>
            <div className="flex flex-col items-center">
                <div className={styles.component_title}>BENEFITS<br /></div>
            </div>
            <div className={styles.block_benefits}>
                <div className={styles.benefits_details}>
                    <div className={styles.benefits_icon}>
                        <div className={styles.num}>1</div>
                    </div>
                    <div className={styles.benefits_description}>Best Win ration 50%+</div>
                </div>
                <div className={styles.benefit_seperate}></div>
                <div className={styles.benefits_details}>
                    <div className={styles.benefits_icon_red}>
                        <div className={styles.num}>2</div>
                    </div>
                    <div className={styles.benefits_description}>You play peer to peer, not against the house.</div>
                </div>
                <div className={styles.benefit_seperate}></div>
                <div className={styles.benefits_details}>
                    <div className={styles.benefits_icon}>
                        <div className={styles.num}>3</div>
                    </div>
                    <div className={styles.benefits_description}>The backend that manages the game is fully audited<br />by the best company in the industry: CERTIK!</div>
                </div>
            </div>
        </div>
    );
}