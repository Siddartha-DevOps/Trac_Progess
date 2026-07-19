import pytest
from datetime import datetime
from app.core.use_cases.schedule_delay_engine import (
    Activity, 
    Relationship, 
    ScheduleProject, 
    ScheduleDelayEngine
)

def test_deterministic_cpm_linear_chain():
    """
    Test 1: Linear sequence of 3 activities (A1 -> A2 -> A3).
    A1 (5d) -> A2 (10d) -> A3 (3d).
    Expected project finish: 18 days. All must be critical.
    """
    activities = [
        Activity(id="A1", name="Excavation", baseline_duration_days=5.0, remaining_duration_days=5.0, actual_progress=0.0),
        Activity(id="A2", name="Concrete Pour", baseline_duration_days=10.0, remaining_duration_days=10.0, actual_progress=0.0),
        Activity(id="A3", name="Curing", baseline_duration_days=3.0, remaining_duration_days=3.0, actual_progress=0.0)
    ]
    
    relationships = [
        Relationship(predecessor_id="A1", successor_id="A2", type="FS"),
        Relationship(predecessor_id="A2", successor_id="A3", type="FS")
    ]
    
    project = ScheduleProject(
        project_id="PROJ-01",
        name="Linear Test",
        activities=activities,
        relationships=relationships
    )
    
    # Calculate CPM
    solved = ScheduleDelayEngine.calculate_cpm(project)
    
    # Map results by ID
    res = {act.id: act for act in solved.activities}
    
    # Verify Early Start & Finish
    assert res["A1"].early_start == 0.0
    assert res["A1"].early_finish == 5.0
    
    assert res["A2"].early_start == 5.0
    assert res["A2"].early_finish == 15.0
    
    assert res["A3"].early_start == 15.0
    assert res["A3"].early_finish == 18.0
    
    # All should be critical in a single serial chain with 0 float
    assert res["A1"].is_critical_path is True
    assert res["A2"].is_critical_path is True
    assert res["A3"].is_critical_path is True
    
    assert res["A1"].total_float == 0.0
    assert res["A2"].total_float == 0.0
    assert res["A3"].total_float == 0.0


def test_deterministic_cpm_parallel_float():
    """
    Test 2: Parallel branch that is non-critical.
    A1 (5d) -> A2 (10d) -> A3 (3d)   [CRITICAL PATH]
    A1 (5d) -> B1 (4d)               [NON-CRITICAL BRANCH]
    Project duration should remain 18 days. B1 should have float.
    """
    activities = [
        Activity(id="A1", name="Excavation", baseline_duration_days=5.0, remaining_duration_days=5.0),
        Activity(id="A2", name="Concrete Pour", baseline_duration_days=10.0, remaining_duration_days=10.0),
        Activity(id="A3", name="Curing", baseline_duration_days=3.0, remaining_duration_days=3.0),
        Activity(id="B1", name="Site Clean", baseline_duration_days=4.0, remaining_duration_days=4.0)
    ]
    
    relationships = [
        Relationship(predecessor_id="A1", successor_id="A2", type="FS"),
        Relationship(predecessor_id="A2", successor_id="A3", type="FS"),
        Relationship(predecessor_id="A1", successor_id="B1", type="FS")
    ]
    
    project = ScheduleProject(
        project_id="PROJ-02",
        name="Parallel Test",
        activities=activities,
        relationships=relationships
    )
    
    solved = ScheduleDelayEngine.calculate_cpm(project)
    res = {act.id: act for act in solved.activities}
    
    # B1 earliest start is after A1 finishes (5.0). Early finish is 5.0 + 4.0 = 9.0
    assert res["B1"].early_start == 5.0
    assert res["B1"].early_finish == 9.0
    
    # Late finish of B1 is project end (18.0). Late start is 18.0 - 4.0 = 14.0
    assert res["B1"].late_finish == 18.0
    assert res["B1"].late_start == 14.0
    
    # Total float of B1 should be late finish - early finish = 18.0 - 9.0 = 9.0 days
    assert res["B1"].total_float == 9.0
    assert res["B1"].is_critical_path is False


def test_parse_primavera_p6_xml():
    """
    Test 3: Parse mock Primavera P6 XML.
    """
    p6_mock_xml = """<?xml version="1.0" encoding="UTF-8"?>
    <APGProject xmlns="http://www.primavera.com/P6/XML">
        <Project>
            <ObjectId>101</ObjectId>
            <Name>Bangalore Cyber Hub</Name>
        </Project>
        <Activities>
            <Activity>
                <ObjectId>ACT-A</ObjectId>
                <Name>Slab MEP Conduit Piping</Name>
                <OriginalDuration>8.0</OriginalDuration>
                <RemainingDuration>8.0</RemainingDuration>
                <PercentComplete>0.0</PercentComplete>
                <StartDate>2026-07-20T08:00:00</StartDate>
                <EndDate>2026-07-28T17:00:00</EndDate>
            </Activity>
            <Activity>
                <ObjectId>ACT-B</ObjectId>
                <Name>Concrete Reinforcement Pour</Name>
                <OriginalDuration>4.0</OriginalDuration>
                <RemainingDuration>0.0</RemainingDuration>
                <PercentComplete>100.0</PercentComplete>
                <StartDate>2026-07-15T08:00:00</StartDate>
                <EndDate>2026-07-19T17:00:00</EndDate>
            </Activity>
        </Activities>
        <Relationships>
            <Relationship>
                <PredecessorActivityObjectId>ACT-B</PredecessorActivityObjectId>
                <SuccessorActivityObjectId>ACT-A</SuccessorActivityObjectId>
                <PredecessorType>FS</PredecessorType>
                <Lag>2.0</Lag>
            </Relationship>
        </Relationships>
    </APGProject>
    """
    
    project = ScheduleDelayEngine.parse_p6_xml(p6_mock_xml)
    
    assert project.project_id == "101"
    assert project.name == "Bangalore Cyber Hub"
    assert len(project.activities) == 2
    
    # Activity ACT-A has MEP in name, trade should resolve to MEP
    act_a = next(a for a in project.activities if a.id == "ACT-A")
    assert act_a.trade == "MEP"
    assert act_a.baseline_duration_days == 8.0
    assert act_a.actual_progress == 0.0
    
    act_b = next(a for a in project.activities if a.id == "ACT-B")
    assert act_b.trade == "Structural"
    assert act_b.actual_progress == 100.0
    
    # Relationship validation
    assert len(project.relationships) == 1
    rel = project.relationships[0]
    assert rel.predecessor_id == "ACT-B"
    assert rel.successor_id == "ACT-A"
    assert rel.lag_days == 2.0


def test_parse_ms_project_xml():
    """
    Test 4: Parse mock MS Project XML.
    """
    msp_mock_xml = """<?xml version="1.0" encoding="UTF-8"?>
    <Project xmlns="http://schemas.microsoft.com/project">
        <Title>Delhi Airport Plaza</Title>
        <Tasks>
            <Task>
                <UID>1</UID>
                <Name>Structural Excavation</Name>
                <Duration>PT40H0M0S</Duration>
                <RemainingDuration>PT40H0M0S</RemainingDuration>
                <PercentComplete>0</PercentComplete>
                <Start>2026-07-18T08:00:00</Start>
                <Finish>2026-07-23T17:00:00</Finish>
            </Task>
            <Task>
                <UID>2</UID>
                <Name>Drywall Framings Zone 2</Name>
                <Duration>PT80H0M0S</Duration>
                <RemainingDuration>PT80H0M0S</RemainingDuration>
                <PercentComplete>0</PercentComplete>
                <Start>2026-07-24T08:00:00</Start>
                <Finish>2026-08-04T17:00:00</Finish>
                <PredecessorLink>
                    <PredecessorUID>1</PredecessorUID>
                    <Type>1</Type>
                    <LinkLag>4800</LinkLag>
                </PredecessorLink>
            </Task>
        </Tasks>
    </Project>
    """
    
    project = ScheduleDelayEngine.parse_msp_xml(msp_mock_xml)
    
    assert project.name == "Delhi Airport Plaza"
    assert len(project.activities) == 2
    
    act1 = next(a for a in project.activities if a.id == "1")
    assert act1.name == "Structural Excavation"
    # 40 hours = 5 days
    assert act1.baseline_duration_days == 5.0
    assert act1.trade == "Structural"
    
    act2 = next(a for a in project.activities if a.id == "2")
    assert act2.name == "Drywall Framings Zone 2"
    assert act2.baseline_duration_days == 10.0
    # Drywall has wall, trade maps to Finishes
    assert act2.trade == "Finishes"
    
    # Predecessor link: Type 1 maps to FS. Lag 4800 tenths of a min = 8 hrs = 1 day
    assert len(project.relationships) == 1
    rel = project.relationships[0]
    assert rel.predecessor_id == "1"
    assert rel.successor_id == "2"
    assert rel.type == "FS"
    assert rel.lag_days == 1.0


def test_monte_carlo_risk_simulation():
    """
    Test 5: Run Monte Carlo simulations on a simple 2-task project.
    Verify that probabilistic metrics and risk score range bounds are respected.
    """
    activities = [
        Activity(id="1", name="Foundation", baseline_duration_days=10.0, remaining_duration_days=10.0),
        Activity(id="2", name="Conduits", baseline_duration_days=5.0, remaining_duration_days=5.0)
    ]
    
    relationships = [
        Relationship(predecessor_id="1", successor_id="2", type="FS")
    ]
    
    project = ScheduleProject(
        project_id="PROJ-MC",
        name="MC Test",
        activities=activities,
        relationships=relationships
    )
    
    # Solved project
    solved = ScheduleDelayEngine.calculate_cpm(project)
    
    # Run simulation
    mc_res = ScheduleDelayEngine.run_monte_carlo(
        project=solved, 
        iterations=100, 
        weather_severity=1.5,  # Add heavy weather penalty
        labor_shortage_factor=1.2  # Add labor penalty
    )
    
    assert mc_res.iteration_runs == 100
    assert mc_res.mean_delay_days >= 0.0
    assert mc_res.p90_delay_days >= mc_res.p50_delay_days
    assert mc_res.p50_delay_days >= mc_res.p10_delay_days
    assert 0.0 <= mc_res.risk_score <= 100.0
    assert 0.0 <= mc_res.completion_probability_by_baseline <= 100.0
    assert len(mc_res.probability_distribution) > 0
