import { useEffect } from "react";
import { useParams, Navigate, useLocation } from "react-router-dom";

/**
 * Legacy route /admin/club/:clubId — now redirects to the enriched
 * account detail page which covers clubs (profile, documents, members).
 */
const ClubDetailPage = () => {
  const { clubId } = useParams();
  const location = useLocation();

  useEffect(() => {
    if (clubId) {
      console.warn(
        `[deprecated] /admin/club/${clubId} is deprecated, use /admin/directory/${clubId} instead`,
      );
    }
  }, [clubId]);

  if (!clubId) {
    // No id in URL (shouldn't happen given the route definition)
    void location;
    return <Navigate to="/admin/directory" replace />;
  }

  return <Navigate to={`/admin/directory/${clubId}`} replace />;
};

export default ClubDetailPage;
