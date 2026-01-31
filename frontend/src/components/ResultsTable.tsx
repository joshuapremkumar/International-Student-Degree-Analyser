import { useState } from 'react';
import { ChevronDown, ChevronUp, ExternalLink, MapPin, DollarSign, Award, Briefcase, Shield, Clock } from 'lucide-react';
import type { UniversityData } from '../types';

interface ResultsTableProps {
  results: UniversityData[];
  degree: string;
}

type SortField = 'ranking' | 'universityName' | 'country' | 'employabilityRank';
type SortOrder = 'asc' | 'desc';

export function ResultsTable({ results, degree }: ResultsTableProps) {
  const [sortField, setSortField] = useState<SortField>('ranking');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedResults = [...results].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case 'ranking':
        comparison = a.ranking - b.ranking;
        break;
      case 'employabilityRank':
        comparison = (a.employabilityRank || 999) - (b.employabilityRank || 999);
        break;
      case 'universityName':
        comparison = a.universityName.localeCompare(b.universityName);
        break;
      case 'country':
        comparison = a.country.localeCompare(b.country);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <span className="text-gray-300">↕</span>;
    return sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div className="w-full animate-fade-in">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Top {results.length} Universities for {degree}
        </h2>
        <span className="text-sm text-gray-500">
          Showing {results.length} results
        </span>
      </div>

      <div className="table-container bg-white overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th 
                className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('ranking')}
              >
                <div className="flex items-center gap-1 font-semibold text-gray-700">
                  Rank <SortIcon field="ranking" />
                </div>
              </th>
              <th 
                className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('universityName')}
              >
                <div className="flex items-center gap-1 font-semibold text-gray-700">
                  University <SortIcon field="universityName" />
                </div>
              </th>
              <th 
                className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleSort('country')}
              >
                <div className="flex items-center gap-1 font-semibold text-gray-700">
                  Country <SortIcon field="country" />
                </div>
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> PSW Duration
                </div>
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" /> Hidden Costs
                </div>
              </th>
              <th className="px-4 py-3 font-semibold text-gray-700">
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" /> Scholarships
                </div>
              </th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedResults.map((uni) => (
              <>
                <tr 
                  key={uni.id}
                  className="hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedRow(expandedRow === uni.id ? null : uni.id)}
                >
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-700 font-bold rounded-full">
                      {uni.ranking}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{uni.universityName}</div>
                    {uni.accreditationBodies.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {uni.accreditationBodies.join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      {uni.country}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                      {uni.pswDuration}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-600">
                      <div>Visa: {uni.visaFees}</div>
                      <div className="text-xs text-gray-500">Insurance: {uni.healthInsurance}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {uni.fullRideAvailable && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                          Full Ride
                        </span>
                      )}
                      {uni.tuitionWaiverAvailable && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Tuition Waiver
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {expandedRow === uni.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </td>
                </tr>
                {expandedRow === uni.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={7} className="px-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* PSW Details */}
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-primary-600" />
                            Post-Study Work Visa
                          </h4>
                          <p className="text-sm text-gray-600">{uni.pswDetails}</p>
                        </div>

                        {/* Industry Match */}
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                            <Briefcase className="w-4 h-4 text-primary-600" />
                            Industry Hub
                          </h4>
                          <p className="text-sm text-gray-600">{uni.industryMatch}</p>
                          {uni.majorEmployers.length > 0 && (
                            <div className="mt-2">
                              <span className="text-xs text-gray-500">Major employers:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {uni.majorEmployers.map((employer) => (
                                  <span key={employer} className="text-xs px-2 py-1 bg-gray-100 rounded">
                                    {employer}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Employability */}
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                            <Shield className="w-4 h-4 text-primary-600" />
                            Employability
                          </h4>
                          {uni.employabilityRank && (
                            <p className="text-sm text-gray-600">Rank: #{uni.employabilityRank}</p>
                          )}
                          {uni.graduateEmploymentRate && (
                            <p className="text-sm text-gray-600">Employment Rate: {uni.graduateEmploymentRate}</p>
                          )}
                          {uni.avgStartingSalary && (
                            <p className="text-sm text-gray-600">Avg Salary: {uni.avgStartingSalary}</p>
                          )}
                        </div>

                        {/* Costs */}
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                            <DollarSign className="w-4 h-4 text-primary-600" />
                            Financial Requirements
                          </h4>
                          <p className="text-sm text-gray-600">Proof of Funds: {uni.proofOfFunds}</p>
                          <p className="text-sm text-gray-600">Health Insurance: {uni.healthInsurance}</p>
                          <p className="text-sm text-gray-600">Visa Fees: {uni.visaFees}</p>
                        </div>

                        {/* Scholarships */}
                        <div className="bg-white p-4 rounded-lg shadow-sm md:col-span-2">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2 mb-2">
                            <Award className="w-4 h-4 text-primary-600" />
                            Scholarship Opportunities
                          </h4>
                          {uni.fullRideAvailable && uni.fullRideDetails && (
                            <div className="mb-2">
                              <span className="text-sm font-medium text-purple-700">Full Ride:</span>
                              <p className="text-sm text-gray-600">{uni.fullRideDetails}</p>
                            </div>
                          )}
                          {uni.tuitionWaiverAvailable && uni.tuitionWaiverDetails && (
                            <div>
                              <span className="text-sm font-medium text-blue-700">Tuition Waiver:</span>
                              <p className="text-sm text-gray-600">{uni.tuitionWaiverDetails}</p>
                            </div>
                          )}
                        </div>

                        {/* Source */}
                        {uni.sourceUrl && (
                          <div className="md:col-span-2 text-right">
                            <a
                              href={uni.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
                              onClick={(e) => e.stopPropagation()}
                            >
                              View Source <ExternalLink className="w-3 h-3" />
                            </a>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
