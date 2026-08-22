/* eslint-disable react/prop-types */
import Breadcrumb from "../layout/Breadcrumb";

export default function PageHeader({ title, description, actions, path }) {
  return (
    <div className="mb-8">
      <Breadcrumb path={path} />
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{title}</h1>
          {description && (
            <p className="mt-1 max-w-2xl text-sm text-slate-500">{description}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </div>
    </div>
  );
}
