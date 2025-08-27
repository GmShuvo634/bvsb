import Image from 'next/image';
import styles from './home.module.css'; 
export default function WinRatio({url, title, subTitle, value, theme, text_color}:{url:string, title:string, subTitle:string, value:string, theme:string, text_color:string}) {
    return (
        <div className={theme}>
            <div className="w-24 h-24 bg-transparent rounded justify-center items-center p-0 flex absolute top-[-20%] bottom-auto">
                <div className="w-11 h-11 bg-orange-200 rounded-full absolute opacity-60 blur"></div><Image src={url} alt={title} className="relative" width={44} height={44} />
            </div>
            <div className={`${text_color} font-oswald text-lg font-medium leading-5`}>{subTitle}</div>
            <div className={`${text_color} font-oswald text-4xl font-medium leading-normal`}>{title}</div>
            <div className={styles.data_separator}></div>
            <div className={styles.data_text}>{value}</div>
        </div>
    );
}