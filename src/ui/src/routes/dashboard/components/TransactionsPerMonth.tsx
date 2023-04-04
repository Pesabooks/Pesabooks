import { Box, Card } from '@chakra-ui/react';
import { ApexOptions } from 'apexcharts';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import Loading from '../../../components/Loading';
import { supabase } from '../../../supabase';

const options: ApexOptions = {
  chart: {
    toolbar: {
      show: false, 
    },
  },
  tooltip: {
    theme: 'dark',
  },
  dataLabels: {
    enabled: false,
  },
  stroke: {
    curve: 'smooth',
  },
  xaxis: {
    type: 'category',
    labels: {
      style: {
        colors: '#c8cfca',
        fontSize: '12px',
      },
    },
  },
  yaxis: {
    labels: {
      style: {
        colors: '#c8cfca',
        fontSize: '12px',
      },
    },
  },
  legend: {
    show: true,
  },
  grid: {
    strokeDashArray: 5,
  },
  fill: {
    type: 'gradient',
    gradient: {
      shade: 'light',
      type: 'vertical',
      shadeIntensity: 0.5,
      gradientToColors: undefined, // optional, if not defined - uses the shades of same color in series
      inverseColors: true,
      opacityFrom: 0.8,
      opacityTo: 0,
      stops: [],
    },
    colors: ['#4FD1C5', '#f44336'],
  },
  colors: ['#4FD1C5', '#f44336'],
};
interface TransactionsPerMonthProps {
  pool_id: string;
}

export const TransactionsPerMonth = ({ pool_id }: TransactionsPerMonthProps) => {
  const [series, setSeries] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await supabase().rpc('get_transactions_per_month', { pool_id }).single();

        const deposit = [];
        const withdrawal = [];

        if (data) {
          // @ts-ignore
          for (const d of data) {
            const month = dayjs(d.month).format('MMM YYYY');
            deposit.push({ x: month, y: d.deposit });
            withdrawal.push({ x: month, y: d.withdrawal });
          }
        }

        setSeries([
          { name: 'Deposit', data: deposit },
          { name: 'Withdrawal', data: withdrawal },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [pool_id]);

  return (
    <Card p="28px 10px 16px 0px" mb={{ sm: '26px', lg: '0px' }}>
      <Box w="100%" h={{ sm: '300px' }} ps="8px">
        {isLoading ? (
          <Loading />
        ) : (
          <Chart options={options} series={series as any} type="bar" width="100%" height="100%" />
        )}
      </Box>
    </Card>
  );
};
