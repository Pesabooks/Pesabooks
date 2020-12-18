using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Pesabooks.Common.Dto
{
    public class PagedResultDto<T>
    {
        public int TotalCount { get; set; }
        public IReadOnlyList<T> Items { get; set; }
        public bool HasNext { get; set; }

        public PagedResultDto(int totalCount, IReadOnlyList<T> items, bool hasNext)
        {
            TotalCount = totalCount;
            Items = items;
            HasNext = hasNext;
        }
    }
}
