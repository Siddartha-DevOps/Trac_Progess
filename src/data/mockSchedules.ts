export const MOCK_P6_XML_BANGALORE = `<?xml version="1.0" encoding="UTF-8"?>
<APGProject xmlns="http://www.primavera.com/P6/XML">
    <Project>
        <ObjectId>PRJ-BLR-02</ObjectId>
        <Name>Bangalore Cyber Hub Phase 2</Name>
    </Project>
    <Activities>
        <Activity>
            <ObjectId>ACT-001</ObjectId>
            <Name>Excavation &amp; Site Grading</Name>
            <PlannedDuration>5.0</PlannedDuration>
            <RemainingDuration>0.0</RemainingDuration>
            <PercentComplete>100.0</PercentComplete>
            <StartDate>2026-07-01T08:00:00</StartDate>
            <EndDate>2026-07-06T17:00:00</EndDate>
        </Activity>
        <Activity>
            <ObjectId>ACT-002</ObjectId>
            <Name>Foundation Footing Concrete Pour</Name>
            <PlannedDuration>7.0</PlannedDuration>
            <RemainingDuration>0.0</RemainingDuration>
            <PercentComplete>100.0</PercentComplete>
            <StartDate>2026-07-07T08:00:00</StartDate>
            <EndDate>2026-07-14T17:00:00</EndDate>
        </Activity>
        <Activity>
            <ObjectId>ACT-003</ObjectId>
            <Name>Core Columns Rebar Placement (L1)</Name>
            <PlannedDuration>6.0</PlannedDuration>
            <RemainingDuration>5.0</RemainingDuration>
            <PercentComplete>15.0</PercentComplete>
            <StartDate>2026-07-15T08:00:00</StartDate>
            <EndDate>2026-07-21T17:00:00</EndDate>
        </Activity>
        <Activity>
            <ObjectId>ACT-004</ObjectId>
            <Name>Suspended Slab Casting (L1)</Name>
            <PlannedDuration>8.0</PlannedDuration>
            <RemainingDuration>8.0</RemainingDuration>
            <PercentComplete>0.0</PercentComplete>
            <StartDate>2026-07-22T08:00:00</StartDate>
            <EndDate>2026-07-30T17:00:00</EndDate>
        </Activity>
        <Activity>
            <ObjectId>ACT-005</ObjectId>
            <Name>MEP Risers &amp; Fire Line Pipe-work</Name>
            <PlannedDuration>10.0</PlannedDuration>
            <RemainingDuration>10.0</RemainingDuration>
            <PercentComplete>0.0</PercentComplete>
            <StartDate>2026-07-31T08:00:00</StartDate>
            <EndDate>2026-08-10T17:00:00</EndDate>
        </Activity>
        <Activity>
            <ObjectId>ACT-006</ObjectId>
            <Name>Drywall framing &amp; Partition Masonry</Name>
            <PlannedDuration>12.0</PlannedDuration>
            <RemainingDuration>12.0</RemainingDuration>
            <PercentComplete>0.0</PercentComplete>
            <StartDate>2026-08-11T08:00:00</StartDate>
            <EndDate>2026-08-23T17:00:00</EndDate>
        </Activity>
        <Activity>
            <ObjectId>ACT-007</ObjectId>
            <Name>Exterior Unitized Glazing System</Name>
            <PlannedDuration>14.0</PlannedDuration>
            <RemainingDuration>14.0</RemainingDuration>
            <PercentComplete>0.0</PercentComplete>
            <StartDate>2026-08-24T08:00:00</StartDate>
            <EndDate>2026-09-07T17:00:00</EndDate>
        </Activity>
    </Activities>
    <Relationships>
        <Relationship>
            <PredecessorActivityObjectId>ACT-001</PredecessorActivityObjectId>
            <SuccessorActivityObjectId>ACT-002</SuccessorActivityObjectId>
            <PredecessorType>FS</PredecessorType>
            <Lag>0.0</Lag>
        </Relationship>
        <Relationship>
            <PredecessorActivityObjectId>ACT-002</PredecessorActivityObjectId>
            <SuccessorActivityObjectId>ACT-003</SuccessorActivityObjectId>
            <PredecessorType>FS</PredecessorType>
            <Lag>1.0</Lag>
        </Relationship>
        <Relationship>
            <PredecessorActivityObjectId>ACT-003</PredecessorActivityObjectId>
            <SuccessorActivityObjectId>ACT-004</SuccessorActivityObjectId>
            <PredecessorType>FS</PredecessorType>
            <Lag>0.0</Lag>
        </Relationship>
        <Relationship>
            <PredecessorActivityObjectId>ACT-004</PredecessorActivityObjectId>
            <SuccessorActivityObjectId>ACT-005</SuccessorActivityObjectId>
            <PredecessorType>FS</PredecessorType>
            <Lag>0.0</Lag>
        </Relationship>
        <Relationship>
            <PredecessorActivityObjectId>ACT-004</PredecessorActivityObjectId>
            <SuccessorActivityObjectId>ACT-006</SuccessorActivityObjectId>
            <PredecessorType>SS</PredecessorType>
            <Lag>4.0</Lag>
        </Relationship>
        <Relationship>
            <PredecessorActivityObjectId>ACT-006</PredecessorActivityObjectId>
            <SuccessorActivityObjectId>ACT-007</SuccessorActivityObjectId>
            <PredecessorType>FS</PredecessorType>
            <Lag>0.0</Lag>
        </Relationship>
    </Relationships>
</APGProject>`;

export const MOCK_MSP_XML_DELHI = `<?xml version="1.0" encoding="UTF-8"?>
<Project xmlns="http://schemas.microsoft.com/project">
    <Title>Delhi Airport T3 Terminal Expansion</Title>
    <Tasks>
        <Task>
            <UID>10</UID>
            <Name>Piling &amp; Substructure Foundations</Name>
            <Duration>PT80H0M0S</Duration>
            <RemainingDuration>PT0H0M0S</RemainingDuration>
            <PercentComplete>100</PercentComplete>
            <Start>2026-07-01T08:00:00</Start>
            <Finish>2026-07-10T17:00:00</Finish>
        </Task>
        <Task>
            <UID>20</UID>
            <Name>Steel Column Fabrications &amp; Erection</Name>
            <Duration>PT64H0M0S</Duration>
            <RemainingDuration>PT40H0M0S</RemainingDuration>
            <PercentComplete>37</PercentComplete>
            <Start>2026-07-11T08:00:00</Start>
            <Finish>2026-07-18T17:00:00</Finish>
            <PredecessorLink>
                <PredecessorUID>10</PredecessorUID>
                <Type>1</Type>
                <LinkLag>0</LinkLag>
            </PredecessorLink>
        </Task>
        <Task>
            <UID>30</UID>
            <Name>Composite Deck Slab Concreting</Name>
            <Duration>PT48H0M0S</Duration>
            <RemainingDuration>PT48H0M0S</RemainingDuration>
            <PercentComplete>0</PercentComplete>
            <Start>2026-07-19T08:00:00</Start>
            <Finish>2026-07-25T17:00:00</Finish>
            <PredecessorLink>
                <PredecessorUID>20</PredecessorUID>
                <Type>1</Type>
                <LinkLag>0</LinkLag>
            </PredecessorLink>
        </Task>
        <Task>
            <UID>40</UID>
            <Name>Electrical High-Voltage Main Line Risers</Name>
            <Duration>PT96H0M0S</Duration>
            <RemainingDuration>PT96H0M0S</RemainingDuration>
            <PercentComplete>0</PercentComplete>
            <Start>2026-07-26T08:00:00</Start>
            <Finish>2026-08-05T17:00:00</Finish>
            <PredecessorLink>
                <PredecessorUID>30</PredecessorUID>
                <Type>1</Type>
                <LinkLag>0</LinkLag>
            </PredecessorLink>
        </Task>
        <Task>
            <UID>50</UID>
            <Name>HVAC Chillers Placement &amp; Ducts</Name>
            <Duration>PT80H0M0S</Duration>
            <RemainingDuration>PT80H0M0S</RemainingDuration>
            <PercentComplete>0</PercentComplete>
            <Start>2026-07-26T08:00:00</Start>
            <Finish>2026-08-04T17:00:00</Finish>
            <PredecessorLink>
                <PredecessorUID>30</PredecessorUID>
                <Type>1</Type>
                <LinkLag>0</LinkLag>
            </PredecessorLink>
        </Task>
        <Task>
            <UID>60</UID>
            <Name>Internal Masonry Walls &amp; Plastering</Name>
            <Duration>PT112H0M0S</Duration>
            <RemainingDuration>PT112H0M0S</RemainingDuration>
            <PercentComplete>0</PercentComplete>
            <Start>2026-08-05T08:00:00</Start>
            <Finish>2026-08-18T17:00:00</Finish>
            <PredecessorLink>
                <PredecessorUID>40</PredecessorUID>
                <Type>2</Type>
                <LinkLag>1600</LinkLag>
            </PredecessorLink>
        </Task>
        <Task>
            <UID>70</UID>
            <Name>Airport Terminal Facade Cladding</Name>
            <Duration>PT120H0M0S</Duration>
            <RemainingDuration>PT120H0M0S</RemainingDuration>
            <PercentComplete>0</PercentComplete>
            <Start>2026-08-19T08:00:00</Start>
            <Finish>2026-09-02T17:00:00</Finish>
            <PredecessorLink>
                <PredecessorUID>60</PredecessorUID>
                <Type>1</Type>
                <LinkLag>0</LinkLag>
            </PredecessorLink>
        </Task>
    </Tasks>
</Project>`;
