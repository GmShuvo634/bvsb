import styles from './home.module.css';
import Link from 'next/link'
export default function AppChainInfo() {
    return (
        <div className={styles.section_polygon}>
            <div className={styles.title_container}>
                <div className={styles.component_title}>‍BLOCKCHAIN<br /></div>
                <div className={styles.h2_polygon}>NETWORK<br /></div>
            </div>
            <div className={styles.polyseperator}></div>
            <div className={styles.polygon_text}>
                <div className={styles.polygon_gif}></div>
                <div className={styles.polygon_description}>
                    <div className={styles.detail_sub_text}>The game is running on #1 Web3 ethereum blockchain network,<br />to play the game you need to have ETH coins.<br /></div>
                </div>
                <div className={styles.polygon_sub}>
                    <div className={styles.detail_text}>OUR GAME IS #1 WEB3 GAME IN THE ETHEREUM NETWORK!<br /></div>
                </div>
            </div>
            <div className={styles.polygon_buttons}>
                <Link href="/play" className={styles.button_polygon}>Play Now</Link>
                <Link href="/faq" className={styles.button_polygon_play}>How to Play</Link>
            </div>
        </div>
    );
}