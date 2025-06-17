// frontend/src/components/ContestHistory.js
import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import * as studentApi from '../API/studentApi';
import { format } from 'date-fns';
import './contestHistory.css'; // Import component-specific CSS

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const ContestHistory = ({ studentId }) => {
    const [filterDays, setFilterDays] = useState('365'); // Default to last 365 days
    const [contestData, setContestData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (studentId) {
            fetchContestHistory();
        }
    }, [studentId, filterDays]);

    const fetchContestHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await studentApi.getStudentContestHistory(studentId, filterDays);
            setContestData(response.data);
        } catch (err) {
            setError('Failed to fetch contest history. Please ensure Codeforces handle is valid.');
            console.error('Error fetching contest history:', err);
        } finally {
            setLoading(false);
        }
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: 'var(--chart-text-color)', // Dynamic color based on theme
                },
            },
            title: {
                display: true,
                text: 'Codeforces Rating History',
                color: 'var(--chart-text-color)', // Dynamic color based on theme
            },
            tooltip: {
                backgroundColor: 'var(--chart-tooltip-bg-color)',
                titleColor: 'var(--chart-tooltip-title-color)',
                bodyColor: 'var(--chart-tooltip-body-color)',
                borderColor: 'var(--chart-tooltip-border-color)',
                borderWidth: 1,
                cornerRadius: 4,
                padding: 10,
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Contest Date',
                    color: 'var(--chart-text-color)',
                },
                ticks: {
                    color: 'var(--chart-text-color)',
                },
                grid: {
                    color: 'var(--chart-grid-line-color)',
                }
            },
            y: {
                title: {
                    display: true,
                    text: 'Rating',
                    color: 'var(--chart-text-color)',
                },
                ticks: {
                    color: 'var(--chart-text-color)',
                },
                grid: {
                    color: 'var(--chart-grid-line-color)',
                }
            }
        },
    };

    const chartData = {
        labels: contestData.map((c) => format(new Date(c.participationTime), 'MMM dd, yy')),
        datasets: [
            {
                label: 'Rating',
                data: contestData.map((c) => c.newRating),
                borderColor: 'var(--primary-dark)',
                backgroundColor: 'rgba(79, 70, 229, 0.5)',
                tension: 0.1,
                pointRadius: 3,
                pointBackgroundColor: 'var(--primary-dark)',
            },
        ],
    };

    if (loading) return <div className="loading-message">Loading contest history...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (contestData.length === 0) return <div className="no-data-message">No contest history found for the selected period.</div>;

    return (
        <div className="contest-history-container card-shadow">
            <h3 className="contest-history-title">Contest History</h3>

            <div className="filter-group">
                <label htmlFor="contestFilter" className="filter-label">
                    Filter by:
                </label>
                <select
                    id="contestFilter"
                    value={filterDays}
                    onChange={(e) => setFilterDays(e.target.value)}
                    className="filter-select"
                >
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                    <option value="365">Last 365 Days</option>
                    <option value="">All Time</option>
                </select>
            </div>

            <div className="chart-container">
                <Line data={chartData} options={chartOptions} />
            </div>

            <h4 className="contest-list-title">Contest List</h4>
            <div className="table-wrapper">
                <table className="contest-table">
                    <thead>
                        <tr>
                            <th>Contest Name</th>
                            <th>Date</th>
                            <th>Rank</th>
                            <th>Old Rating</th>
                            <th>New Rating</th>
                            <th>Rating Change</th>
                            <th>Unsolved Problems</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contestData.map((contest) => (
                            <tr key={contest._id}>
                                <td>
                                    <a
                                        href={`https://codeforces.com/contest/${contest.contestId}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="contest-name-link"
                                    >
                                        {contest.contestName}
                                    </a>
                                </td>
                                <td>
                                    {format(new Date(contest.participationTime), 'yyyy-MM-dd')}
                                </td>
                                <td>{contest.rank}</td>
                                <td>{contest.oldRating}</td>
                                <td>{contest.newRating}</td>
                                <td className={contest.ratingChange >= 0 ? 'rating-change-positive' : 'rating-change-negative'}>
                                    {contest.ratingChange > 0 ? `+${contest.ratingChange}` : contest.ratingChange}
                                </td>
                                <td>{contest.unsolvedProblems}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ContestHistory;
