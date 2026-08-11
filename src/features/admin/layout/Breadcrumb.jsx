/* eslint-disable react/prop-types */
import { breadcrumbLabels } from "../config/sidebarConfig";

export default function Breadcrumb({ path, extra = [] }) {
  const segments = path ? path.split("/").filter(Boolean) : [];
  const crumbs = [{ label: "Admin", path: "dashboard" }];

  if (path && path !== "dashboard") {
    let built = "";
    segments.forEach((segment) => {
      built = built ? `${built}/${segment}` : segment;
      crumbs.push({
        label: breadcrumbLabels[built] || segment,
        path: built,
      });
    });
  }

  extra.forEach((item) => crumbs.push(item));

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
      {crumbs.map((crumb, index) => (
        <span className="flex items-center gap-2" key={`${crumb.label}-${index}`}>
          {index > 0 && <span className="text-slate-300">/</span>}
          <span
            className={
              index === crumbs.length - 1
                ? "font-medium text-slate-900"
                : "text-slate-500"
            }
          >
            {crumb.label}
          </span>
        </span>
      ))}
    </nav>
  );
}
