import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useAccount } from "wagmi";
import Header from "@/layouts/header";
import { toast } from "react-toastify";
import { generateReferral } from "@/components/api";

export default function Home() {
  const { isConnected } = useAccount();

  const [referralLinks, setReferralLinks] = useState([]);
  const [dateSorted, setDateSorted] = useState(false);
  const [friendsSorted, setFriendsSorted] = useState(false);
  const [todayEarnSorted, setTodayEarnSorted] = useState(false);
  const [totalEarningsSorted, setTotalEarningsSorted] = useState(false);

  useEffect(() => {
    const getReferralLinks = async () => {
      const response = await generateReferral();
      console.log(response);
      if (response?.status == 200) {
        setReferralLinks((response as any).data.data);
      } else {
        toast.error(response?.data?.msg);
      }
    };

    if (isConnected) {
      getReferralLinks();
    }
  }, [isConnected]);

  return (
    <div className="flex flex-row justify-between w-screen">
      <div className="w-full transition-all duration-1000 ease-in-out">
        <Header
          setChatVisible={() => { }}
          setReferralLinkData={(data) => setReferralLinks(data as any)}
          isChatview={false}
          hiddenChat={true}
        />
        <div className="absolute z-10 top-[72px] left-0 w-full h-[calc(100vh-72px)] bg-[#161721]">
          <div className="flex flex-col items-center gap-5 py-10">
            <span className="font-oswald text-[#fff699] text-xl uppercase">
              referral program link manager
            </span>
            <div className="overflow-x-auto w-full">
              <div className="w-full inline-block align-middle">
                <div className="overflow-auto">
                  <div className="w-full h-[1px] bg-gradient-to-r from-[#00000000] via-[#b66dff] to-[#00000000]" />
                  {referralLinks !== null && (
                    <table className="min-w-full bg-table">
                      <thead>
                        <tr className="w-full h-14 bg-[#111016] font-oswald text-[10px] sm:text-base text-[#fff699] uppercase">
                          <th scope="col" className="hidden sm:table-cell px-6 py-4 text-center">
                            <div
                              className="flex justify-center items-center cursor-pointer"
                              onClick={() => {
                                const sorted = (
                                  referralLinks as Array<any>
                                ).sort(function (a, b) {
                                  if (dateSorted === false) {
                                    return (
                                      new Date(a.createdAt).getTime() -
                                      new Date(b.createdAt).getTime()
                                    );
                                  } else {
                                    return (
                                      new Date(b.createdAt).getTime() -
                                      new Date(a.createdAt).getTime()
                                    );
                                  }
                                });
                                setDateSorted(!dateSorted);
                                setReferralLinks(([...sorted] as any));
                              }}
                            >
                              <span className="cursor-pointer inline-flex items-center">
                                date created
                              </span>
                              <div className="sort">
                                <Image
                                  src="images/home/sort.svg"
                                  alt="Sort"
                                  width={16}
                                  height={16}
                                />
                              </div>
                            </div>
                          </th>
                          <th scope="col" className="hidden sm:table-cell px-6 py-4 text-center">
                            <span className="cursor-pointer inline-flex items-center">
                              name
                            </span>
                          </th>
                          <th scope="col" className="hidden sm:table-cell px-6 py-4 text-center">
                            <span className="cursor-pointer inline-flex items-center">
                              link
                            </span>
                          </th>
                          <th scope="col" className="hidden sm:table-cell px-6 py-4 text-center">
                            <div
                              className="flex justify-center items-center cursor-pointer"
                              onClick={() => {
                                const sorted = (
                                  referralLinks as Array<any>
                                ).sort(function (a, b) {
                                  if (friendsSorted === false) {
                                    return a.count - b.count;
                                  } else {
                                    return b.count - a.count;
                                  }
                                });
                                setFriendsSorted(!friendsSorted);
                                setReferralLinks(([...sorted] as any));
                              }}
                            >
                              <span className="cursor-pointer inline-flex items-center">
                                friends registered
                              </span>
                              <div className="sort">
                                <Image
                                  src="images/home/sort.svg"
                                  alt="Sort"
                                  width={16}
                                  height={16}
                                />
                              </div>
                            </div>
                          </th>
                          <th scope="col" className="hidden sm:table-cell px-6 py-4 text-center">
                            <div
                              className="flex justify-center items-center cursor-pointer"
                              onClick={() => {
                                const sorted = (
                                  referralLinks as Array<any>
                                ).sort(function (a, b) {
                                  if (todayEarnSorted === false) {
                                    return a.todayEarning - b.todayEarning;
                                  } else {
                                    return b.todayEarning - a.todayEarning;
                                  }
                                });
                                setTodayEarnSorted(!todayEarnSorted);
                                setReferralLinks(([...sorted] as any));
                              }}
                            >
                              <span className="cursor-pointer inline-flex items-center">
                                earn today
                              </span>
                              <div className="sort">
                                <Image
                                  src="images/home/sort.svg"
                                  alt="Sort"
                                  width={16}
                                  height={16}
                                />
                              </div>
                            </div>
                          </th>
                          <th scope="col" className="hidden sm:table-cell px-6 py-4 text-center">
                            <div
                              className="flex justify-center items-center cursor-pointer"
                              onClick={() => {
                                const sorted = (
                                  referralLinks as Array<any>
                                ).sort(function (a, b) {
                                  if (totalEarningsSorted === false) {
                                    return a.totalEarning - b.totalEarning;
                                  } else {
                                    return b.totalEarning - a.totalEarning;
                                  }
                                });
                                setTotalEarningsSorted(!totalEarningsSorted);
                                setReferralLinks(([...sorted] as any));
                              }}
                            >
                              <span className="cursor-pointer inline-flex items-center">
                                earnings total
                              </span>
                              <div className="sort">
                                <Image
                                  src="images/home/sort.svg"
                                  alt="Sort"
                                  width={16}
                                  height={16}
                                />
                              </div>
                            </div>
                          </th>
                          <th scope="col" className="sm:hidden px-2 py-4 text-center">
                            <div
                              className="flex justify-center items-center cursor-pointer"
                              onClick={() => {
                                const sorted = (
                                  referralLinks as Array<any>
                                ).sort(function (a, b) {
                                  if (dateSorted === false) {
                                    return (
                                      new Date(a.createdAt).getTime() -
                                      new Date(b.createdAt).getTime()
                                    );
                                  } else {
                                    return (
                                      new Date(b.createdAt).getTime() -
                                      new Date(a.createdAt).getTime()
                                    );
                                  }
                                });
                                setDateSorted(!dateSorted);
                                setReferralLinks(([...sorted] as any));
                              }}
                            >
                              <span className="cursor-pointer inline-flex items-center">
                                date/name
                              </span>
                              <div>
                                <Image
                                  className="w-4 h-4 ml-1"
                                  src="/images/home/sort.svg"
                                  width={16}
                                  height={16}
                                  alt="Sort"
                                />
                              </div>
                            </div>
                          </th>
                          <th scope="col" className="sm:hidden px-2 py-4 text-center">
                            <div
                              className="flex justify-center items-center cursor-pointer"
                              onClick={() => {
                                const sorted = (
                                  referralLinks as Array<any>
                                ).sort(function (a, b) {
                                  if (friendsSorted === false) {
                                    return a.count - b.count;
                                  } else {
                                    return b.count - a.count;
                                  }
                                });
                                setFriendsSorted(!friendsSorted);
                                setReferralLinks(([...sorted] as any));
                              }}
                            >
                              <span className="cursor-pointer inline-flex items-center">
                                friends
                              </span>
                              <div>
                                <Image
                                  className="w-4 h-4 ml-1"
                                  src="/images/home/sort.svg"
                                  width={16}
                                  height={16}
                                  alt="Sort"
                                />
                              </div>
                            </div>
                          </th>
                          <th scope="col" className="sm:hidden px-2 py-4 text-center">
                            <div
                              className="flex justify-center items-center cursor-pointer"
                              onClick={() => {
                                const sorted = (
                                  referralLinks as Array<any>
                                ).sort(function (a, b) {
                                  if (todayEarnSorted === false) {
                                    return a.todayEarning - b.todayEarning;
                                  } else {
                                    return b.todayEarning - a.todayEarning;
                                  }
                                });
                                setTodayEarnSorted(!todayEarnSorted);
                                setReferralLinks(([...sorted] as any));
                              }}
                            >
                              <span className="cursor-pointer inline-flex items-center">
                                earn today
                              </span>
                              <div>
                                <Image
                                  className="w-4 h-4 ml-1"
                                  src="/images/home/sort.svg"
                                  width={16}
                                  height={16}
                                  alt="Sort"
                                />
                              </div>
                            </div>
                          </th>
                          <th scope="col" className="sm:hidden px-2 py-4 text-center">
                            <div
                              className="flex justify-center items-center cursor-pointer"
                              onClick={() => {
                                const sorted = (
                                  referralLinks as Array<any>
                                ).sort(function (a, b) {
                                  if (totalEarningsSorted === false) {
                                    return a.totalEarning - b.totalEarning;
                                  } else {
                                    return b.totalEarning - a.totalEarning;
                                  }
                                });
                                setTotalEarningsSorted(!totalEarningsSorted);
                                setReferralLinks(([...sorted] as any));
                              }}
                            >
                              <span className="cursor-pointer inline-flex items-center">
                                earnings total
                              </span>
                              <div>
                                <Image
                                  className="w-4 h-4 ml-1"
                                  src="/images/home/sort.svg"
                                  width={16}
                                  height={16}
                                  alt="Sort"
                                />
                              </div>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="w-full text-sm font-medium text-neutral-black-700">
                        {(Array.isArray(referralLinks)
                          ? referralLinks
                          : []
                        ).map((item: any, index: number) => {
                          return (
                            <tr
                              key={index}
                              className="hidden sm:table-row w-full h-14 bg-[#111016] font-oswald text-base text-[#fff699]"
                            >
                              <td className="text-center px-6 py-2">
                                <p>
                                  {String(
                                    new Date(item.createdAt).getDate()
                                  ).padStart(2, "0") +
                                    "/" +
                                    String(
                                      new Date(item.createdAt).getMonth() + 1
                                    ).padStart(2, "0") +
                                    "/" +
                                    new Date(item.createdAt).getFullYear()}
                                </p>
                              </td>
                              <td className="text-center px-6 py-2">
                                <p>{item.name}</p>
                              </td>
                              <td className="text-center px-6 py-2">
                                <div className="flex gap-2 justify-center items-center w-full">
                                  <p>{item.link}</p>
                                  <svg
                                    className="fill-[#fff699] hover:fill-[#e0e0e0] w-5 h-5 transition-all ease-in-out duration-500 cursor-pointer"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    onClick={() => {
                                      navigator.clipboard.writeText(item.link);
                                      toast.success("Copied!");
                                    }}
                                  >
                                    <g
                                      id="SVGRepo_bgCarrier"
                                      strokeWidth="0"
                                    ></g>
                                    <g
                                      id="SVGRepo_tracerCarrier"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    ></g>
                                    <g id="SVGRepo_iconCarrier">
                                      <path
                                        fillRule="evenodd"
                                        clipRule="evenodd"
                                        d="M19.5 16.5L19.5 4.5L18.75 3.75H9L8.25 4.5L8.25 7.5L5.25 7.5L4.5 8.25V20.25L5.25 21H15L15.75 20.25V17.25H18.75L19.5 16.5ZM15.75 15.75L15.75 8.25L15 7.5L9.75 7.5V5.25L18 5.25V15.75H15.75ZM6 9L14.25 9L14.25 19.5L6 19.5L6 9Z"
                                      ></path>
                                    </g>
                                  </svg>
                                </div>
                              </td>
                              <td className="text-center px-6 py-2">
                                <p>{item.count}</p>
                              </td>
                              <td className="text-center px-6 py-2">
                                <p>{item.todayEarning}</p>
                              </td>
                              <td className="text-center px-6 py-2">
                                <p>{item.totalEarning}</p>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tbody className="sm:hidden text-[10px] font-medium text-neutral-black-700">
                        {(Array.isArray(referralLinks)
                          ? referralLinks
                          : []
                        ).map((item: any, index: number) => {
                          return (
                            <>
                              <tr
                                key={index}
                                className="w-full h-14 bg-[#111016] font-oswald text-[#fff699]"
                              >
                                <td className="text-center px-6 py-2">
                                  <p>
                                    {String(
                                      new Date(item.createdAt).getDate()
                                    ).padStart(2, "0") +
                                      "/" +
                                      String(
                                        new Date(item.createdAt).getMonth() + 1
                                      ).padStart(2, "0") +
                                      "/" +
                                      new Date(item.createdAt).getFullYear()}
                                    <br />
                                    {item.name}
                                  </p>
                                </td>
                                <td className="text-center px-6 py-2">
                                  <p>{item.count}</p>
                                </td>
                                <td className="text-center px-6 py-2">
                                  <p>{item.todayEarning}</p>
                                </td>
                                <td className="text-center px-6 py-2">
                                  <p>{item.totalEarning}</p>
                                </td>
                              </tr>
                              <tr
                                className="w-full h-14 bg-[#111016] font-oswald text-[#fff699]"
                              >
                                <td colSpan={4} className="text-center px-6 py-2">
                                  <div className="flex gap-2 justify-center items-center w-full">
                                    <p>{item.link}</p>
                                    <svg
                                      className="fill-[#fff699] hover:fill-[#e0e0e0] w-5 h-5 transition-all ease-in-out duration-500 cursor-pointer"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                      onClick={() => {
                                        navigator.clipboard.writeText(item.link);
                                        toast.success("Copied!");
                                      }}
                                    >
                                      <g
                                        id="SVGRepo_bgCarrier"
                                        strokeWidth="0"
                                      ></g>
                                      <g
                                        id="SVGRepo_tracerCarrier"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                      ></g>
                                      <g id="SVGRepo_iconCarrier">
                                        <path
                                          fillRule="evenodd"
                                          clipRule="evenodd"
                                          d="M19.5 16.5L19.5 4.5L18.75 3.75H9L8.25 4.5L8.25 7.5L5.25 7.5L4.5 8.25V20.25L5.25 21H15L15.75 20.25V17.25H18.75L19.5 16.5ZM15.75 15.75L15.75 8.25L15 7.5L9.75 7.5V5.25L18 5.25V15.75H15.75ZM6 9L14.25 9L14.25 19.5L6 19.5L6 9Z"
                                        ></path>
                                      </g>
                                    </svg>
                                  </div>
                                </td>
                              </tr>
                            </>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
