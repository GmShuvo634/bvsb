import Image from 'next/image';
import styles from './home.module.css'; 
export default function MonthlyJackpot() {
    return (
        <div className={styles.section_monthly_jackpot}>
            <div className={styles.title_container}>
                <div className={styles.component_title}>MONTHLY<br /></div>
                <div className={styles.jackpot_title}>JACKPOT<br /></div>
            </div>
            <div className={styles.separator}></div>
            <div className={styles.jackpot_text_container}>
                <div className={styles.jackpot_bear}><Image src="/images/home/jackpot_month.png" alt="Monthly Jackpot" width={350} height={300} /></div>
                <div className={styles.jackpot_sub}>
                    <div className={styles.detail_text}>10% OF THE PLATFORM&#x27;S INCOME WILL BE RAFFLED AMONG ALL THE PARTICIPANTS IN THE GAME.<br /></div>
                </div>
                <div className={styles.jackpot_description}>
                    <div className={styles.detail_sub_text}>Each transaction you take earns you a lottery ticket, the more you play, the more lottery tickets you will have and your chances of winning will increase, good luck!<br /></div>
                </div>
            </div>
        </div>
    );
}