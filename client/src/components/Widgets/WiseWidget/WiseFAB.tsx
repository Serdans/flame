import Fab from "@mui/material/Fab";
import Work from "@mui/icons-material/Work";
import Drawer from "@mui/material/Drawer";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Alert, Badge, Box, List, ListItemButton, ListItemText, Snackbar, Typography } from "@mui/material";
import styles from './WiseFAB.module.css';

type WiseFabProps = {}

type JobResponse = {
    code: number;
    data: {
        max_pages: number;
        message: string;
        posts: Job[];
        total_count: number;
    }
}

type Job = {
    id: number;
    title: string;
    permalink: string;
    office: string;
    team: string;
}

const VIEWED_JOB_ID_KEY = 'viewedJobIds';

export const WiseFab = ({ }: WiseFabProps) => {

    const [jobs, setJobs] = useState<Job[]>([]);
    const [open, setOpen] = useState(false);
    const [notify, setNotify] = useState(false);
    const localIdString = localStorage.getItem(VIEWED_JOB_ID_KEY);

    const [viewedIds] = useState<number[] | null>(localIdString ? JSON.parse(localIdString) : null);

    const handleJobs = async () => {
        const res = await axios.get<JobResponse>('https://www.wise.jobs/wp-json/transferwisecareers/v1/search?search=&offices[]=15&teams[]=48&orderby=date&order=ASC&q=&page=1');
        const jobData = res.data.data.posts;
        const unviewed: boolean = viewedIds == null || !!jobData.find((val) => !viewedIds.includes(val.id));
        setNotify(unviewed);
        setJobs(jobData);
    }

    useEffect(() => {
        handleJobs()
            .catch((e) => console.log(e));
    }, []);

    useEffect(() => {
        if (open && jobs.length > 0) {
            const newViewedIds = jobs.map((job) => job.id);
            localStorage.setItem(VIEWED_JOB_ID_KEY, JSON.stringify(newViewedIds));
        }
    }, [open]);

    return (
        <>
            <Drawer
                anchor='right'
                open={open}
                onClose={() => setOpen(false)}
            >
                <div
                    className={styles.wiseDrawer}
                >
                    <Typography className={styles.text} padding={2} paddingBottom={0} variant='h4'>
                        Jobs
                    </Typography>
                    <List>
                        {jobs.map((j) => (
                            <ListItemButton target='__blank' href={j.permalink} key={j.id}>
                                <ListItemText
                                    className={styles.text}
                                    secondaryTypographyProps={{
                                        color: 'var(--color-accent)'
                                    }}

                                    primary={j.title}
                                    secondary={`${j.team} | ${j.office}`}
                                />
                            </ListItemButton>
                        ))}
                    </List>
                </div>
            </Drawer>
            <Box component='div' className={styles.fabContainer}>
                <Badge
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left'
                    }}
                    classes={{
                        badge: styles.fabBadge
                    }}
                    badgeContent={jobs.length}
                >
                    <Fab
                        className={styles.fabContent}
                        onClick={() => setOpen((old) => !old)}
                    >
                        <Work />
                    </Fab>
                </Badge>
            </Box>
            <Snackbar
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right'
                }}
                open={notify}
                onClose={() => setNotify(false)}
            >
                <Alert
                    onClose={() => setNotify(false)}
                    severity="info"
                    style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-background)',
                    }}
                    sx={{ width: '100%' }}
                >
                    There are new jobs available!
                </Alert>
            </Snackbar>
        </>
    );
};
