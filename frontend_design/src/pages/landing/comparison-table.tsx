import styles from './home.module.css';
import Link from 'next/link';
import Image from 'next/image';
export default function Comparison({
  title,
  ratio,
  type,
}: {
  title: string;
  ratio: string;
  type: string;
}) {
  return (
    <div className={`flex flex-col relative border-[2px]  ${type == "1" ? "border-[#b5a176] bg-gradient-to-tl from-black to-[rgba(255,221,159,.18)]" : "border-[#272139] bg-gradient-to-tl from-black to-[rgba(255, 255, 255, .14)]"} rounded-[25px] p-[35px_25px] w-[285px] h-[500px]`}>
      {type == "1" && (
        <div className="flex justify-center items-start absolute top-0 bottom-auto left-0 right-0">
          <div className="flex static w-[111px] bg-transparent bg-gradient-to-tl from-[#c48657] to-[#dad092] rounded-br-md rounded-bl-md justify-center items-center py-1 font-sans text-sm font-semibold leading-3">
            <div className="text-white">Most Popular</div>
          </div>
        </div>
      )}
      <div className="flex flex-col items-start gap-5">
        <div className="text-[#ececec] font-oswald text-lg leading-5">{title}</div>
        <div className="flex flex-col items-start gap-3">
          <div className="text-[#ffeea4] font-oswald text-5xl font-bold leading-5">{ratio}</div>
          <div className="text-[#9e8d5c] ml-0 font-oswald text-lg font-normal leading-[20px]">win ratio</div>
        </div>
      </div>
      <div className="w-4/5 h-px bg-gradient-to-br from-black via-gray-400 to-transparent my-6 mx-auto"></div>
      <div className={styles.table_details}>
        <div className={styles.table_icon}>
          <Image
            src="images/home/close.svg"
            alt="Close icon"
            className="w-4/5"
            width={16}
            height={16}
          />
        </div>
        <div className={styles.table_content}>Winning Withdraw</div>
      </div>
      <div className={styles.table_details}>
        <div className={styles.table_icon}>
          <Image
            src="images/home/valid.svg"
            alt="Valid icon"
            className="w-4/5"
            width={16}
            height={16}
          />
        </div>
        <div className={styles.table_content}>Deposit</div>
      </div>
      <div className={styles.table_details}>
        <div className={styles.table_icon}>
          <Image
            src={
              type == "1" ? "images/home/close.svg" : "images/home/valid.svg"
            }
            alt={type == "1" ? "Close icon" : "Valid icon"}
            className="w-4/5"
            width={16}
            height={16}
          />
        </div>
        <div className={styles.table_content}>Play against the house</div>
      </div>
      <div className={styles.table_details}>
        <div className={styles.table_icon}>
          <Image
            src={
              type == "1" ? "/images/home/valid.svg" : "/images/home/close.svg"
            }
            width={16}
            height={16}
            alt={type == "1" ? "Valid icon" : "Close icon"}
            className="w-4/5"
          />
        </div>
        <div className={styles.table_content}>Chance to win</div>
      </div>
      <div className={styles.table_details}>
        <div className={styles.table_icon}>
          <Image
            src={
              type == "1" ? "/images/home/valid.svg" : "/images/home/close.svg"
            }
            width={16}
            height={16}
            alt={type == "1" ? "Valid icon" : "Close icon"}
            className="w-4/5"
          />
        </div>
        <div className={styles.table_content}>Peer to Peer</div>
      </div>
      <div className={styles.table_details}>
        <div className={styles.table_icon}>
          <Image
            src={
              type == "1" ? "/images/home/valid.svg" : "/images/home/close.svg"
            }
            width={16}
            height={16}
            alt={type == "1" ? "Valid icon" : "Close icon"}
            className="w-4/5"
          />
        </div>
        <div className={styles.table_content}>Transparency</div>
      </div>
      {type == "1" && (
        <Link href="/play" className="flex w-4/5 h-9 bg-gradient-to-tl from-[#745f32] to-[#ffeea4] border-2 border-[#050504] hover:border-[#ffffd3] rounded-full justify-center items-center mt-6 py-3 text-center font-sans text-white text-sm font-semibold leading-5 self-center">
          Play Now
        </Link>
      )}
    </div>
  );
}
