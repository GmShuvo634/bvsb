import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import Header from "@/layouts/header";
import { getReferralReport } from "@/components/api";
import { toast } from "sonner";
import { Pagination } from "@/components/pagination";

export default function Home() {

  const { isConnected } = useAccount();

  const [referralReport, setReferralReport] = useState(null);
  const [pageTotalCount, setPageTotalCount] = useState(0);

  useEffect(() => {
    if (isConnected) {
      getReferralReportData(0);
    }
  }, [isConnected]);

  const getReferralReportData = async (currentPageNum: number) => {
    const response = await getReferralReport(currentPageNum);
    console.log(response);
    if (response?.status == 200) {
      setReferralReport((response as any)?.data.data.reportData);
      setPageTotalCount(
        Math.floor(
          (response as any).data.data.page_total /
            (response as any).data.data.page_count
        )
      );
    } else {
      toast.error(response?.data?.msg);
    }
  };

  return (
    <div className="flex flex-row justify-between w-screen">
      <div className="w-full transition-all duration-1000 ease-in-out">
        <Header
          setChatVisible={() => {}}
          setReferralLinkData={(data) => {}}
          isChatview={false}
          hiddenChat={true}
        />
        <div className="absolute z-10 top-[72px] left-0 w-full h-[calc(100vh-72px)] bg-[#161721]">
          <div className="flex flex-col items-center gap-5 py-10">
            <span className="font-oswald text-[#fff699] text-xl uppercase">
              referral program earnings report
            </span>
            <div className="overflow-x-auto w-full">
              <div className="w-full inline-block align-middle">
                <div className="overflow-auto">
                  <div className="w-full h-[1px] bg-gradient-to-r from-[#00000000] via-[#b66dff] to-[#00000000]" />
                  {referralReport !== null && (
                    <table className="min-w-full bg-table">
                      <thead className="">
                        <tr className="w-full h-14 bg-[#111016] font-oswald text-[10px] sm:text-base text-[#fff699] uppercase">
                          <th scope="col" className="px-2 sm:px-6 py-4 text-center">
                            <span className="cursor-pointer inline-flex items-center">
                              date
                            </span>
                          </th>
                          <th scope="col" className="px-2 sm:px-6 py-4 text-center">
                            <span className="cursor-pointer inline-flex items-center">
                              tier
                            </span>
                          </th>
                          <th scope="col" className="px-2 sm:px-6 py-4 text-center">
                            <span className="cursor-pointer inline-flex items-center">
                              total amount
                            </span>
                          </th>
                          <th scope="col" className="px-2 sm:px-6 py-4 text-center">
                            <span className="cursor-pointer inline-flex items-center">
                              status
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody className="text-sm font-medium text-neutral-black-700">
                        {(referralReport as Array<any>).map(
                          (item: any, index: number) => {
                            return (
                              <tr
                                key={index}
                                className="w-full h-14 bg-[#111016] font-oswald text-[10px] sm:text-base text-[#fff699]"
                              >
                                <td className="text-center px-2 sm:px-6 py-2">
                                  <p>{item.date}</p>
                                </td>
                                <td className="text-center px-2 sm:px-6 py-2">
                                  <p>{item.referral}</p>
                                </td>
                                <td className="text-center px-2 sm:px-6 py-2">
                                  <p>{item.earn}</p>
                                </td>
                                <td className="text-center px-2 sm:px-6 py-2">
                                  <p></p>
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              {pageTotalCount >= 1 && (
                <Pagination
                  pageCount={pageTotalCount}
                  gotoPage={(page) => getReferralReportData(page)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
