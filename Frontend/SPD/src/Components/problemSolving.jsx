// frontend/src/components/ProblemSolvingData.js
import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css'; // Default styles
import * as studentApi from '../API/studentApi';
import { subDays, format, isSameDay } from 'date-fns';
import './problemSolving.css'; // Import component-specific CSS

// Register Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const ProblemSolvingData = ({ studentId }) => {
    const [filterDays, setFilterDays] = useState('90'); // Default to last 90 days
    const [problemData, setProblemData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (studentId) {
            fetchProblemSolvingData();
        }
    }, [studentId, filterDays]);

    const fetchProblemSolvingData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await studentApi.getStudentProblemSolvingData(studentId, filterDays);
            setProblemData(response.data);
        } catch (err) {
            setError('Failed to fetch problem solving data. Please ensure Codeforces handle is valid.');
            console.error('Error fetching problem solving data:', err);
        } finally {
            setLoading(false);
        }
    };

    // Prepare data for Problem Rating Buckets Bar Chart
    const getProblemRatingChartData = () => {
        if (!problemData || !problemData.problemRatingBuckets) return { labels: [], datasets: [] };

        const buckets = Object.keys(problemData.problemRatingBuckets).sort((a, b) => parseInt(a) - parseInt(b));
        const labels = buckets.map(bucket => `${bucket}-${parseInt(bucket) + 99}`);
        const data = buckets.map(bucket => problemData.problemRatingBuckets[bucket]);

        return {
            labels,
            datasets: [
                {
                    label: 'Problems Solved',
                    data,
                    backgroundColor: 'rgba(79, 70, 229, 0.7)', // Using primary color for bars
                    borderColor: 'rgba(79, 70, 229, 1)',
                    borderWidth: 1,
                },
            ],
        };
    };

    const problemRatingChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: 'var(--chart-text-color)',
                },
            },
            title: {
                display: true,
                text: 'Problems Solved by Rating Bucket',
                color: 'var(--chart-text-color)',
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
                    text: 'Rating Bucket',
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
                    text: 'Number of Problems',
                    color: 'var(--chart-text-color)',
                },
                ticks: {
                    color: 'var(--chart-text-color)',
                    stepSize: 1, // Ensure integer ticks for problem count
                },
                grid: {
                    color: 'var(--chart-grid-line-color)',
                }
            }
        },
    };

    // Prepare data for Submission Heatmap
    const getHeatmapData = () => {
        if (!problemData || !problemData.submissionHeatmap) return [];

        return Object.entries(problemData.submissionHeatmap).map(([date, count]) => ({
            date: date,
            count: count,
        }));
    };

    const today = new Date();
    const startDate = subDays(today, parseInt(filterDays) - 1); // Heatmap goes up to filterDays back
    const heatmapValues = getHeatmapData();

    if (loading) return <div className="loading-message">Loading problem solving data...</div>;
    if (error) return <div className="error-message">{error}</div>;
    if (!problemData || problemData.totalProblemsSolved === 0) return <div className="no-data-message">No problem solving data found for the selected period.</div>;

    return (
        <div className="problem-data-container card-shadow">
            <h3 className="problem-data-title">Problem Solving Data</h3>

            <div className="filter-group">
                <label htmlFor="problemFilter" className="filter-label">
                    Filter by:
                </label>
                <select
                    id="problemFilter"
                    value={filterDays}
                    onChange={(e) => setFilterDays(e.target.value)}
                    className="filter-select"
                >
                    <option value="7">Last 7 Days</option>
                    <option value="30">Last 30 Days</option>
                    <option value="90">Last 90 Days</option>
                    <option value="">All Time</option>
                </select>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <p className="stat-label">Total Problems Solved</p>
                    <p className="stat-value">{problemData.totalProblemsSolved}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Most Difficult Problem</p>
                    <p className="stat-problem-name">
                        {problemData.mostDifficultProblem ? problemData.mostDifficultProblem.name : 'N/A'}
                    </p>
                    <p className="stat-problem-rating">
                        Rating: {problemData.mostDifficultProblem ? problemData.mostDifficultProblem.rating : 'N/A'}
                    </p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Average Rating</p>
                    <p className="stat-value">{problemData.averageRating}</p>
                </div>
                <div className="stat-card">
                    <p className="stat-label">Avg. Problems per Day</p>
                    <p className="stat-value">{problemData.averageProblemsPerDay}</p>
                </div>
            </div>

            <h4 className="chart-title">Problems Solved by Rating Bucket</h4>
            <div className="bar-chart-container">
                <Bar data={getProblemRatingChartData()} options={problemRatingChartOptions} />
            </div>

            <h4 className="chart-title">Submission Heatmap ({filterDays === '' ? 'All Time' : `Last ${filterDays} Days`})</h4>
            <div className="heatmap-container">
                <CalendarHeatmap
                    startDate={startDate}
                    endDate={today}
                    values={heatmapValues}
                    classForValue={(value) => {
                        if (!value) {
                            return 'color-empty';
                        }
                        return `color-github-${Math.min(value.count, 4)}`; // 4 levels of intensity
                    }}
                    tooltipDataAttrs={(value) => {
                        if (!value || !value.date) {
                            return { 'data-tip': 'No submissions' };
                        }
                        return { 'data-tip': `${value.count || 0} submissions on ${format(new Date(value.date), 'MMM dd, yyyy')}` };
                    }}
                    showWeekdayLabels={true}
                    gutterSize={2}
                    horizontal={true}
                />
            </div>
        </div>
    );
};

export default ProblemSolvingData;
