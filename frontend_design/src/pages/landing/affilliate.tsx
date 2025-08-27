import Image from 'next/image';
import styles from './home.module.css';
export default function Affilliate() {
    return (
        <div className={styles.section_affiliate}>
            <div className={styles.component_title}>JOIN OUR<br />AFFILIATE PROGRAM</div>
            <div className={styles.block_affiliate}>
                <div className={styles.affiliate_in}>
                    <div className={styles.top}>
                        <div className={styles.pfp}><Image src="/images/home/pfp.png" alt="Profile Picture" className={styles.avatar} width={80} height={80} /></div>
                        <div className={styles.lines}>
                            <div className={styles.line1}></div>
                            <div className={styles.line2}></div>
                            <div className={styles.line3}></div>
                            <div className={styles.line4}></div>
                        </div>
                    </div>
                    <div className={styles.separator_affi}></div>
                    <div className={styles.btm}>
                        <div className={styles.card_title}>AFFILIATE PROGAM.</div>
                    </div>
                </div>
            </div>
            <div className={styles.jackpot_text_container}>
                <div className={styles.jackpot_sub}>
                    <div className={styles.detail_text}>GET UP TO 35% COMMISION<br />ON YOUR FRIENDS EARNING FEES<br /></div>
                </div>
                <div className={styles.jackpot_description}>
                    <div className={styles.detail_sub_text}>Bring your friends to play and get automated daily passive income directly to your wallet, from the winning fees they pay!<br /></div>
                </div>
            </div>
        </div>
    );
}