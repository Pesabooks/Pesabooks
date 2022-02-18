import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import { getCurrentUserProfile } from '../services/profilesService';

export const RedirectToPool = () => {
  let navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentUserProfile().then((user) => {
      setLoading(false);
      if (user?.last_pool_id) {
        navigate(`/pool/${user.last_pool_id}`, {});
      } else {
        //todo: check existing pool for user
        navigate('/new-pool');
      }
    });
  }, [navigate]);

  if (loading) return <Loading />;
  return <Outlet />;
};
