import Image from 'next/image';
import styles from './home.module.css'; 
export default function WeeklyJackpot() {
    return (
        <div className={styles.section_week_jackpot}>
            <div className={styles.title_container}>
                <div className={styles.component_title}>WEEKLY<br /></div>
                <div className={styles.jackpot_title}>JACKPOT<br /></div>
            </div>
            <div className={styles.separator}></div>
            <div className={styles.jackpot_text_container}>
                <div className={styles.jackpot_sub}>
                    <div className={styles.detail_text}>10% OF THE PLATFORM&#x27;S INCOME WILL BE RAFFLED AMONG ALL THE PARTICIPANTS IN THE GAME.<br /></div>
                </div>
                <div className={styles.jackpot_description}>
                    <div className={styles.detail_sub_text}>You have 5 prize pools that gives you the best chance to win, if you are a heavy gainer you will have a big chance, if you are a small fish you can still win, as many trades you do, your chances will be higher!<br /></div>
                </div>
            </div>
            <div className={styles.separator}></div>
            <div className={styles.block_jackpot}>
                <div className={styles.jackpot_details}>
                    <div className="text-[#ffc170] font-oswald text-4xl font-medium leading-none">JACKPOT</div>
                    <div className={styles.data_separator}></div>
                    <div className={styles.data_text}>17 ETH</div>
                </div>
                <Image src="/images/home/jackpot_week.png" alt="Weekly Jackpot" className="h-[550px]" width={441} height={550} />
            </div>
        </div>
    );
}