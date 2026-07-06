/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { ShieldCheck, Layers, ClipboardList } from "lucide-react";

interface KeyPropertiesAndSpecsProps {
  grade?: string;
  material?: string;
  application?: string;
  standard?: string;
  keyProperties: Record<string, string | number>;
  technicalSpecs: Record<string, string | number>;
}

export default function KeyPropertiesAndSpecs({
  grade,
  material,
  application,
  standard,
  keyProperties,
  technicalSpecs,
}: KeyPropertiesAndSpecsProps) {
  // Helpers to check if a value is valid
  const isValid = (val: any) => {
    if (val === null || val === undefined) return false;
    const str = String(val).trim();
    return str !== "" && str.toLowerCase() !== "null" && str.toLowerCase() !== "undefined";
  };

  // Group properties into categories
  const hasGeneralProperties =
    isValid(grade) || isValid(material) || isValid(application) || isValid(standard) || Object.keys(keyProperties).length > 0;
  const hasTechnicalSpecs = Object.keys(technicalSpecs).length > 0;

  if (!hasGeneralProperties && !hasTechnicalSpecs) {
    return (
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-8 text-center text-zinc-500">
        <ClipboardList className="mx-auto mb-2 opacity-30" size={32} />
        <p className="text-sm">Specifications available on request</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden w-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center gap-2">
        <ClipboardList size={20} className="text-blue-600" />
        <h3 className="text-lg font-bold text-zinc-900">Technical Specifications & Key Properties</h3>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Column 1: Key Properties & Material Standards */}
          {hasGeneralProperties && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
                <ShieldCheck size={16} className="text-blue-600" />
                <h4 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">
                  Material & Key Properties
                </h4>
              </div>

              <div className="overflow-hidden rounded-xl border border-zinc-100">
                <table className="min-w-full divide-y divide-zinc-100">
                  <tbody className="divide-y divide-zinc-100 bg-white">
                    {isValid(material) && (
                      <tr className="hover:bg-zinc-50/30 transition-colors">
                        <td className="w-1/3 px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50/50">
                          Material
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-zinc-800 whitespace-pre-wrap">
                          {material}
                        </td>
                      </tr>
                    )}
                    {isValid(grade) && (
                      <tr className="hover:bg-zinc-50/30 transition-colors">
                        <td className="w-1/3 px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50/50">
                          Grade
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-zinc-800 whitespace-pre-wrap">
                          {grade}
                        </td>
                      </tr>
                    )}
                    {isValid(standard) && (
                      <tr className="hover:bg-zinc-50/30 transition-colors">
                        <td className="w-1/3 px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50/50">
                          Standard
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-zinc-800 whitespace-pre-wrap">
                          {standard}
                        </td>
                      </tr>
                    )}
                    {isValid(application) && (
                      <tr className="hover:bg-zinc-50/30 transition-colors">
                        <td className="w-1/3 px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50/50">
                          Application
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-zinc-800 whitespace-pre-wrap">
                          {application}
                        </td>
                      </tr>
                    )}
                    {Object.entries(keyProperties).map(([key, value]) => (
                      <tr key={key} className="hover:bg-zinc-50/30 transition-colors">
                        <td className="w-1/3 px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50/50 capitalize">
                          {key.replace(/_/g, " ")}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-zinc-800 whitespace-pre-wrap">
                          {String(value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Column 2: Technical Parameters */}
          {hasTechnicalSpecs ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
                <Layers size={16} className="text-zinc-650" />
                <h4 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">
                  Technical Parameters
                </h4>
              </div>

              <div className="overflow-hidden rounded-xl border border-zinc-100">
                <table className="min-w-full divide-y divide-zinc-100">
                  <tbody className="divide-y divide-zinc-100 bg-white">
                    {Object.entries(technicalSpecs).map(([key, value]) => (
                      <tr key={key} className="hover:bg-zinc-50/30 transition-colors">
                        <td className="w-1/3 px-4 py-3 text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50/50 capitalize">
                          {key.replace(/_/g, " ")}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-zinc-800 whitespace-pre-wrap">
                          {String(value)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
                <Layers size={16} className="text-zinc-650" />
                <h4 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">
                  Technical Parameters
                </h4>
              </div>
              <div className="h-full flex items-center justify-center p-8 bg-zinc-50/50 rounded-xl border border-dashed border-zinc-200">
                <p className="text-xs text-zinc-400">No additional technical specs listed.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
