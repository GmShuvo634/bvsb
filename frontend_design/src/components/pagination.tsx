import { useCallback, useState } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

interface Button2Props {
  content: any;
  onClick: () => void;
  active: boolean;
  disabled: boolean;
}

function Button2({ content, onClick, active, disabled }: Button2Props) {
  return (
    <button
      className={`flex flex-col cursor-pointer items-center justify-center w-9 h-9 shadow-[0_4px_10px_rgba(0,0,0,0.03)] text-sm font-normal transition-colors rounded-lg
      ${active ? 'bg-[#e5c869] text-primary' : 'text-red-500'}
      ${
        !disabled
          ? 'bg-background border border-secondary border-opacity-50 text-primary hover:bg-[#e5c869]'
          : 'bg-background border border-secondary border-opacity-50 text-primary hover:bg-[#e5c869] cursor-not-allowed'
      }
      `}
      onClick={onClick}
      disabled={disabled}
    >
      {content}
    </button>
  )
}

interface PaginationNav1Props {
  gotoPage: (page: number) => void;
  canPreviousPage: boolean;
  canNextPage: boolean;
  pageCount: number;
  pageIndex: number;
}

function PaginationNav1({ gotoPage, canPreviousPage, canNextPage, pageCount, pageIndex }: PaginationNav1Props) {
  const renderPageLinks = useCallback(() => {
    if (pageCount === 0) return null
    const visiblePageButtonCount = 3
    let numberOfButtons = pageCount < visiblePageButtonCount ? pageCount : visiblePageButtonCount
    const pageIndices = [pageIndex]
    numberOfButtons--
    ;[...Array(numberOfButtons)].forEach((_item, itemIndex) => {
      const pageNumberBefore = pageIndices[0] - 1
      const pageNumberAfter = pageIndices[pageIndices.length - 1] + 1
      if (
        pageNumberBefore >= 0 &&
        (itemIndex < numberOfButtons / 2 || pageNumberAfter > pageCount - 1)
      ) {
        pageIndices.unshift(pageNumberBefore)
      } else {
        pageIndices.push(pageNumberAfter)
      }
    })
    return pageIndices.map((pageIndexToMap) => (
      <li key={pageIndexToMap}>
        <Button2
          content={pageIndexToMap + 1}
          onClick={() => gotoPage(pageIndexToMap)}
          active={pageIndex === pageIndexToMap}
          disabled={false}
        />
      </li>
    ))
  }, [pageCount, pageIndex, gotoPage])
  return (
    <ul className='flex gap-2'>
      <li>
        <Button2
          content={
            <div className='flex ml-1'>
              <FaChevronLeft size='0.6rem' />
              <FaChevronLeft size='0.6rem' className='-translate-x-1/2' />
            </div>
          }
          onClick={() => gotoPage(0)}
          active={true}
          disabled={!canPreviousPage}
        />
      </li>
      {renderPageLinks()}
      <li>
        <Button2
          content={
            <div className='flex ml-1'>
              <FaChevronRight size='0.6rem' />
              <FaChevronRight size='0.6rem' className='-translate-x-1/2' />
            </div>
          }
          onClick={() => gotoPage(pageCount - 1)}
          active={true}
          disabled={!canNextPage}
        />
      </li>
    </ul>
  )
}

interface PaginationProps {
  pageCount: number;
  gotoPage: (page: number) => void;
}

const Pagination = ({ pageCount, gotoPage }: PaginationProps) => {
  const [pageIndex, setPageIndex] = useState(0)
  return (
    <div className='flex gap-3 flex-wrap p-6 py-12'>
      <PaginationNav1
        gotoPage={(page: number) => {
          setPageIndex(page)
          gotoPage(page)
        }}
        canPreviousPage={pageIndex > 0}
        canNextPage={pageIndex < pageCount - 1}
        pageCount={pageCount}
        pageIndex={pageIndex}
      />
    </div>
  )
}

export { Pagination }
