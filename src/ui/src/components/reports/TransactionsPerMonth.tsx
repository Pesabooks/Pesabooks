import { Box } from '@chakra-ui/react';
import { ApexOptions } from 'apexcharts';
import { useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import { supabase } from '../../supabase';
import { Card } from '../Card';
import Loading from '../Loading';

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
  pool_id: number;
}

export const TransactionsPerMonth = ({ pool_id }: TransactionsPerMonthProps) => {
  const [series, setSeries] = useState<unknown[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await supabase.rpc('get_transactions_per_month', { pool_id });

        const deposit = [];
        const withdrawal = [];

        if (data) {
          for (const d of data) {
            deposit.push({ x: d.month, y: d.deposit });
            withdrawal.push({ x: d.month, y: d.withdrawal });
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
          <Loading/>
        ) : (
          <Chart options={options} series={series} type="bar" width="100%" height="100%" />
        )}
      </Box>
    </Card>
  );
};
